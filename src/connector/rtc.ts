import { grpc } from '@improbable-eng/grpc-web';
import { IonService, IonBaseConnector } from './ion';
import Client, { Configuration, Trickle, Signal } from './client';
import { EventEmitter } from 'events';
import * as sfu_rpc from '../_library/proto/rtc/rtc_pb_service';
import * as pb from '../_library/proto/rtc/rtc_pb';
import { LocalStream, RemoteStream, Constraints } from './stream';


export enum StreamState {
    NONE,
    ADD,
    REMOVE,
}

export interface StreamEvent {
    state: StreamState;
    streams: Stream[];
}


export interface Simulcast {
    rid: string;
    direction: string;
    parameters: string;
};

export interface Track {
    id: string;
    kind: string;
    simulcast: Array<Simulcast>;
}

export interface Stream {
    id: string;
    tracks: Track[];
}

export class IonSDKRTC implements IonService {
    name: string;
    connector: IonBaseConnector;
    connected: boolean;
    config?: Configuration;
    protected _rpc?: grpc.Client<pb.Signalling, pb.Signalling>;
    private _sfu?: Client;
    private _sig?: IonSFUGRPCSignal;
    ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;
    ondatachannel?: (ev: RTCDataChannelEvent) => void;
    onspeaker?: (ev: string[]) => void;
    onstreamevent?: (ev: StreamEvent) => void;

    constructor(connector: IonBaseConnector, config?: Configuration) {
        this.name = "rtc";
        this.config = config;
        this.connected = false;
        this.connector = connector;
        this.connector.registerService(this);
    }

    async join(sid: string, uid: string) {
        return this._sfu?.join(sid, uid);
    }

    leave() {
        return this._sfu?.leave();
    }

    getPubStats(selector?: MediaStreamTrack) {
        return this._sfu?.getPubStats(selector);
    }

    getSubStats(selector?: MediaStreamTrack) {
        return this._sfu?.getSubStats(selector);
    }

    publish(stream: LocalStream) {
        this._sfu?.publish(stream);
    }

    createDataChannel(label: string) {
        return this._sfu?.createDataChannel(label);
    }

    connect(): void {
        if (!this._sig) {
            this._sig = new IonSFUGRPCSignal(this, this.connector);
        }
        if (!this._sfu) {
            this._sfu = new Client(this._sig, this?.config);
            this._sfu.ontrack = (track: MediaStreamTrack, stream: RemoteStream) =>
                this.ontrack?.call(this, track, stream);
            this._sfu.ondatachannel = (ev: RTCDataChannelEvent) =>
                this.ondatachannel?.call(this, ev);
            this._sfu.onspeaker = (ev: string[]) => this.onspeaker?.call(this, ev);
            this._sig.onstreamevent = (ev: StreamEvent) => this.onstreamevent?.call(this, ev);
        }
    }

    close(): void {
        if (this._sfu) {
            this._sfu.close();
        }
    }
}

class IonSFUGRPCSignal implements Signal {
    connector: IonBaseConnector;
    protected _client: grpc.Client<pb.Signalling, pb.Signalling>;
    private _event: EventEmitter = new EventEmitter();
    onnegotiate?: ((jsep: RTCSessionDescriptionInit) => void) | undefined;
    ontrickle?: ((trickle: Trickle) => void) | undefined;
    onstreamevent?: (ev: StreamEvent) => void;
    constructor(service: IonService, connector: IonBaseConnector) {
        this.connector = connector;
        const client = grpc.client(sfu_rpc.RTC.Signal, this.connector.grpcClientRpcOptions()) as grpc.Client<pb.Signalling, pb.Signalling>;
        client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) =>
            connector.onEnd(service, status, statusMessage, trailers));
        client.onHeaders((headers: grpc.Metadata) => connector.onHeaders(service, headers));
        client.onMessage((reply: pb.Signalling) => {
            switch (reply.getPayloadCase()) {
                case pb.Signalling.PayloadCase.REPLY:
                    const result = reply.getReply();
                    this._event.emit('join-reply', result);
                    break;
                case pb.Signalling.PayloadCase.DESCRIPTION:
                    const desc = reply.getDescription();
                    if (desc?.getType() === 'offer') {
                        if (this.onnegotiate) this.onnegotiate({ sdp: desc.getSdp(), type: 'offer' });
                    } else if (desc?.getType() === 'answer') {
                        this._event.emit('description', { sdp: desc.getSdp(), type: 'answer' });
                    }
                    break;
                case pb.Signalling.PayloadCase.TRICKLE:
                    const pbTrickle = reply.getTrickle();
                    if (pbTrickle?.getInit() !== undefined) {
                        const candidate = JSON.parse(pbTrickle.getInit() as string);
                        const trickle = { target: pbTrickle.getTarget(), candidate };
                        if (this.ontrickle) this.ontrickle(trickle);
                    }
                    break;
                case pb.Signalling.PayloadCase.STREAMEVENT:
                    {
                        const evt = reply.getStreamevent();
                        let state = StreamState.NONE;
                        switch (evt?.getState()) {
                            case pb.StreamEvent.State.ADD:
                                state = StreamState.ADD;
                                break;
                            case pb.StreamEvent.State.REMOVE:
                                state = StreamState.REMOVE;
                                break;
                        };
                        const streams = Array<any>();
                        evt?.getStreamsList().forEach((rtcStream: pb.Stream) => {
                            const tracks = Array<any>();
                            rtcStream.getTracksList().forEach((rtcTrack: pb.Track) => {
                                const simulcasts = Array<any>();
                                rtcTrack.getSimulcastList().forEach((rtcSimulcast: pb.Simulcast) => {
                                    simulcasts.push({
                                        rid: rtcSimulcast.getRid(),
                                        direction: rtcSimulcast.getDirection(),
                                        parameters: rtcSimulcast.getParameters(),
                                    });
                                });
                                tracks.push({
                                    id: rtcTrack.getId(),
                                    kind: rtcTrack.getKind(),
                                    simulcast: simulcasts,
                                    muted: rtcTrack.getMuted(),
                                });
                            });
                            streams.push({
                                msid: rtcStream.getMsid(),
                                uid: rtcStream.getUid(),
                                tracks: tracks || [],
                            });
                        });
                        this.onstreamevent?.call(this, { state, streams });
                    }
                    break;
                case pb.Signalling.PayloadCase.ERROR:
                    break;
            }
        });
        this._client = client;
        this._client.start(this.connector.metadata);
    }

    join(sid: string, uid: string) {
        const request = new pb.Signalling();
        const join = new pb.JoinRequest();
        join.setSid(sid);
        join.setUid(uid);
        request.setJoin(join);
        this._client.send(request);
        return new Promise<any>((resolve, reject) => {
            const handler = (result: pb.JoinReply) => {
                resolve({ success: result.getSuccess(), reason: result.getError()?.toObject() });
                this._event.removeListener('join-reply', handler);
            };
            this._event.addListener('join-reply', handler);
        });
    }

    trickle(trickle: Trickle) {
        const request = new pb.Signalling();
        const pbTrickle = new pb.Trickle();
        pbTrickle.setInit(JSON.stringify(trickle.candidate));
        request.setTrickle(pbTrickle);
        this._client.send(request);
    }

    offer(offer: RTCSessionDescriptionInit) {
        const request = new pb.Signalling();
        let dest = new pb.SessionDescription();
        dest.setSdp(offer.sdp || '');
        dest.setType(offer.type || '');
        dest.setTarget(pb.Target.PUBLISHER);
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
        const request = new pb.Signalling();
        let dest = new pb.SessionDescription();
        dest.setSdp(answer.sdp || '');
        dest.setType(answer.type || '');
        dest.setTarget(pb.Target.SUBSCRIBER);
        request.setDescription(dest);
        this._client.send(request);
    }

    close(): void {
        this._client?.close();
    }
}