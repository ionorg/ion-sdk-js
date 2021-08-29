import { grpc } from '@improbable-eng/grpc-web';
import { IonService, IonBaseConnector } from './ion';
import Client, { Configuration, Trickle } from '../client';
import { Signal } from '../signal';
import { EventEmitter } from 'events';
import * as sfu_rpc from '../_library/proto/rtc/rtc_pb_service';
import * as pb from '../_library/proto/rtc/rtc_pb';
import { LocalStream, RemoteStream } from '../stream';
import { rtc } from '../_library/proto/rtc/rtc';

export enum TrackState {
    NONE = 0,
    ADD,
    REMOVE,
}

export interface TrackEvent {
    state: TrackState;
    uid: string;
    tracks: TrackInfo[];
}

export interface VideoInfo {
    width: number,
    height: number,
    framerate: number,
    simulcast: Map<string, string> | undefined,
}

export enum MediaType {
    MEDIAUNKNOWN = 0,
    USERMEDIA = 1,
    SCREENCAPTURE = 2,
    CAVANS = 3,
    STREAMING = 4,
    VOIP = 5,
};

export interface TrackInfo {
    id: string;
    kind: string;
    muted: boolean;
    type: MediaType;
    stream_id: string;
    label: string;
    // videoinfo: VideoInfo | undefined;
    subscribe: boolean;
    layer: string,
    direction: string,
    width: number,
    height: number,
    frame_rate: number,
}

export interface JoinConfig {
    no_publish: boolean;
    no_subscribe: boolean;
    no_auto_subscribe: boolean;
}

export interface Error {
    code: number;
    reason: string;
}

export interface Result {
    success: boolean;
    error: Error | undefined;
}

export class IonSDKRTC implements IonService {
    name: string;
    connector: IonBaseConnector;
    connected: boolean;
    config?: Configuration;
    protected _rpc?: grpc.Client<pb.Request, pb.Reply>;
    private _rtc?: Client;
    private _sig?: IonRTCGRPCSignal;
    ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;
    ondatachannel?: (ev: RTCDataChannelEvent) => void;
    onspeaker?: (ev: string[]) => void;
    ontrackevent?: (ev: TrackEvent) => void;

    constructor(connector: IonBaseConnector, config?: Configuration) {
        this.name = "rtc";
        this.config = config;
        this.connected = false;
        this.connector = connector;
        this.connector.registerService(this);
    }

    async join(sid: string, uid: string, config: JoinConfig | undefined) {
        this._sig!.config = config;
        return this._rtc?.join(sid, uid);
    }

    leave() {
        return this._rtc?.leave();
    }

    getPubStats(selector?: MediaStreamTrack) {
        return this._rtc?.getPubStats(selector);
    }

    getSubStats(selector?: MediaStreamTrack) {
        return this._rtc?.getSubStats(selector);
    }

    publish(stream: LocalStream) {
        this._sig!.buildTrackInfos(stream);
        this._rtc?.publish(stream);
    }

    subscribe(trackInfos: TrackInfo[]): Promise<Result> | undefined {
        return this._sig?.subscribe(trackInfos);
    }

    updatetrack(tracks: TrackInfo[]): Promise<Result> | undefined {
        return this._sig?.updatetrack(tracks);
    }

    createDataChannel(label: string) {
        return this._rtc?.createDataChannel(label);
    }

    connect(): void {
        if (!this._sig) {
            this._sig = new IonRTCGRPCSignal(this, this.connector);
        }
        if (!this._rtc) {
            this._rtc = new Client(this._sig, this?.config);
            this._rtc.ontrack = (track: MediaStreamTrack, stream: RemoteStream) => {
                // TODO: Attach track info to RemoteStream.
                this.ontrack?.call(this, track, stream);
            }
            this._rtc.ondatachannel = (ev: RTCDataChannelEvent) =>
                this.ondatachannel?.call(this, ev);
            this._rtc.onspeaker = (ev: string[]) => this.onspeaker?.call(this, ev);
            this._sig.ontrackevent = (ev: TrackEvent) => {
                // TODO: Attach RemoteStream info to track event.
                this.ontrackevent?.call(this, ev);
            };
        }
    }

    close(): void {
        if (this._rtc) {
            this._rtc.close();
        }
    }
}

class IonRTCGRPCSignal implements Signal {
    connector: IonBaseConnector;
    protected _client: grpc.Client<pb.Request, pb.Reply>;
    private _event: EventEmitter = new EventEmitter();
    private _tracksInfos?: pb.TrackInfo[];
    onnegotiate?: ((jsep: RTCSessionDescriptionInit) => void) | undefined;
    ontrickle?: ((trickle: Trickle) => void) | undefined;
    ontrackevent?: (ev: TrackEvent) => void;
    private _config?: JoinConfig;
    set config(config: JoinConfig | undefined) {
        this._config = config;
    }
    constructor(service: IonService, connector: IonBaseConnector) {
        this.connector = connector;
        const client = grpc.client(sfu_rpc.RTC.Signal, this.connector.grpcClientRpcOptions()) as grpc.Client<pb.Request, pb.Reply>;
        client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) =>
            connector.onEnd(service, status, statusMessage, trailers));
        client.onHeaders((headers: grpc.Metadata) => connector.onHeaders(service, headers));
        client.onMessage((reply: pb.Reply) => {
            switch (reply.getPayloadCase()) {
                case pb.Reply.PayloadCase.JOIN:
                    const result = reply.getJoin();
                    this._event.emit('join-reply', result);
                    break;
                case pb.Reply.PayloadCase.DESCRIPTION:
                    const desc = reply.getDescription();
                    if (desc?.getType() === 'offer') {
                        if (this.onnegotiate) this.onnegotiate({ sdp: desc.getSdp(), type: 'offer' });
                    } else if (desc?.getType() === 'answer') {
                        this._event.emit('description', { sdp: desc.getSdp(), type: 'answer' });
                    }
                    if (desc?.getTrackinfosList() && desc?.getTrackinfosList().length > 0) {
                        // TODO: process metadata.
                    }
                    break;
                case pb.Reply.PayloadCase.TRICKLE:
                    const pbTrickle = reply.getTrickle();
                    if (pbTrickle?.getInit() !== undefined) {
                        const candidate = JSON.parse(pbTrickle.getInit() as string);
                        const trickle = { target: pbTrickle.getTarget(), candidate };
                        if (this.ontrickle) this.ontrickle(trickle);
                    }
                    break;
                case pb.Reply.PayloadCase.TRACKEVENT:
                    {
                        const evt = reply.getTrackevent();
                        let state = TrackState.NONE;
                        switch (evt?.getState()) {
                            case pb.TrackEvent.State.ADD:
                                state = TrackState.ADD;
                                break;
                            case pb.TrackEvent.State.REMOVE:
                                state = TrackState.REMOVE;
                                break;
                        };
                        const tracks = Array<TrackInfo>();
                        const uid = evt?.getUid() || '';
                        evt?.getTracksList().forEach((rtcTrack: pb.TrackInfo) => {
                            tracks.push({
                                id: rtcTrack.getId(),
                                kind: rtcTrack.getKind(),
                                label: rtcTrack.getLabel(),
                                stream_id: rtcTrack.getStreamid(),
                                muted: rtcTrack.getMuted(),
                                type:  rtcTrack.getType() || MediaType.MEDIAUNKNOWN,
                                layer:rtcTrack.getLayer(),
                                direction:rtcTrack.getDirection(),
                                width:rtcTrack.getWidth()|| 0,
                                height:rtcTrack.getHeight()|| 0,
                                frame_rate:rtcTrack.getFramerate()|| 0,
                                subscribe:rtcTrack.getSubscribe()
                            });
                        });
                        this.ontrackevent?.call(this, { state, tracks, uid });
                    }
                    break;
                case pb.Reply.PayloadCase.UPDATETRACK:
                    const updateTrack = reply.getUpdatetrack();
                    this._event.emit('updatetrack', {
                        success: updateTrack?.getSuccess() || false,
                        error: updateTrack?.getError(),
                    });
                    break;
                case pb.Reply.PayloadCase.SUBSCRIPTION:
                    const subscription = reply.getSubscription();
                    this._event.emit('subscription', {
                        success: subscription?.getSuccess() || false,
                        error: subscription?.getError(),
                    });
                case pb.Reply.PayloadCase.ERROR:
                    break;
            }
        });
        this._client = client;
        this._client.start(this.connector.metadata);
    }

    join(sid: string, uid: null | string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        const request = new pb.Request();
        const join = new pb.JoinRequest();
        join.setSid(sid);
        join.setUid(uid || '');
        if (this._config) {
            join.getConfigMap().set('NoPublish', this._config?.no_publish ? 'true' : 'false');
            join.getConfigMap().set('NoSubscribe', this._config?.no_subscribe ? 'true' : 'false');
            join.getConfigMap().set('NoAutoSubscribe', this._config?.no_auto_subscribe ? 'true' : 'false');
        }
        const dest = new pb.SessionDescription();
        dest.setSdp(offer.sdp || '');
        dest.setType(offer.type || '');
        dest.setTarget(pb.Target.PUBLISHER);
        if (this._tracksInfos) {
            dest.setTrackinfosList(this._tracksInfos);
        }
        join.setDescription(dest);
        request.setJoin(join);
        this._client.send(request);
        return new Promise<any>((resolve, reject) => {
            const handler = (result: pb.JoinReply) => {
                if (result.getSuccess()) {
                    resolve({
                        sdp: result.getDescription()!.getSdp(),
                        type: result.getDescription()!.getType()
                    });
                } else {
                    reject(result.getError()?.toObject());
                }
                this._event.removeListener('join-reply', handler);
            };
            this._event.addListener('join-reply', handler);
        });
    }

    trickle(trickle: Trickle) {
        const request = new pb.Request();
        const pbTrickle = new pb.Trickle();
        pbTrickle.setInit(JSON.stringify(trickle.candidate));
        request.setTrickle(pbTrickle);
        this._client.send(request);
    }

    offer(offer: RTCSessionDescriptionInit) {
        const request = new pb.Request();
        const dest = new pb.SessionDescription();
        dest.setSdp(offer.sdp || '');
        dest.setType(offer.type || '');
        dest.setTarget(pb.Target.PUBLISHER);
        if (this._tracksInfos) {
            dest.setTrackinfosList(this._tracksInfos);
        }
        request.setDescription(dest);
        this._client.send(request);
        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (desc: RTCSessionDescriptionInit) => {
                resolve(desc);
                this._event.removeListener('description', handler);
            };
            this._event.addListener('description', handler);
        });
    }

    answer(answer: RTCSessionDescriptionInit) {
        const request = new pb.Request();
        const desc = new pb.SessionDescription();
        desc.setSdp(answer.sdp || '');
        desc.setType(answer.type || '');
        desc.setTarget(pb.Target.SUBSCRIBER);
        request.setDescription(desc);
        this._client.send(request);
    }

    close(): void {
        this._client?.close();
    }

    subscribe(infos: TrackInfo[]): Promise<Result> {
        const request = new pb.Request();
        const subscription = new pb.SubscriptionRequest();
        // subscription.setTrackidsList(trackIds);
        const tracksInfos = Array<pb.TrackInfo>();
              
        infos.forEach((t: TrackInfo) => {
            const trackInfo = new pb.TrackInfo();
            trackInfo.setId(t.id);
            trackInfo.setKind(t.kind);
            trackInfo.setLabel(t.label);
            trackInfo.setStreamid(t.stream_id);
            trackInfo.setMuted(t.muted);
            trackInfo.setType(t.type);
            trackInfo.setLayer(t.layer);
            trackInfo.setDirection(t.direction);
            trackInfo.setWidth(t.width);
            trackInfo.setHeight(t.height);
            trackInfo.setFramerate(t.frame_rate);
            trackInfo.setSubscribe(t.subscribe);
            tracksInfos.push(trackInfo);
        });
        subscription.setTrackinfosList(tracksInfos);
        request.setSubscription(subscription);
        this._client.send(request);

        return new Promise<Result>((resolve, reject) => {
            const handler = (res: Result) => {
                resolve(res);
                this._event.removeListener('subscription', handler);
            };
            this._event.addListener('subscription', handler);
        });
    }

    updatetrack(tracks: TrackInfo[]) {
        const request = new pb.Request();
        const update = new pb.UpdateTrackRequest();
        const tracksInfo: pb.TrackInfo[] = [];
        tracks.forEach((track: TrackInfo) => {
            const t = new pb.TrackInfo();
            t.setId(track.id);
            t.setKind(track.kind);
            t.setLabel(track.label);
            t.setStreamid(track.stream_id);
            t.setMuted(track.muted);
            t.setType(track.type);
            t.setLayer(track.layer);
            tracksInfo.push(t);
        });
        update.setTracksList(tracksInfo);
        request.setUpdatetrack(update);
        this._client.send(request);

        return new Promise<Result>((resolve, reject) => {
            const handler = (res: Result) => {
                resolve(res);
                this._event.removeListener('updatetrack', handler);
            };
            this._event.addListener('updatetrack', handler);
        });
    }

    buildTrackInfos(stream: LocalStream): void {
        const tracks = stream.getTracks();
        const trackInfos = new Array<pb.TrackInfo>();
        for (const track of tracks) {
            const trackInfo = new pb.TrackInfo;
            trackInfo.setId(track.id);
            trackInfo.setKind(track.kind);
            trackInfo.setLabel(track.label);
            trackInfo.setStreamid(stream.id);
            trackInfo.setMuted(!track.enabled);
            trackInfo.setType(MediaType.USERMEDIA);
            trackInfos.push(trackInfo);
        }
        this._tracksInfos = trackInfos;
    }
}