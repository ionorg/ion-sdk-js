import { grpc } from '@improbable-eng/grpc-web';
import { Code } from '@improbable-eng/grpc-web/dist/typings/Code';
import { BrowserHeaders } from 'browser-headers';
import { IonService, IonBaseConnector } from './ion';
import * as biz from '../signal/_proto/library/biz/biz_pb';
import * as ion from '../signal/_proto/library/biz/ion_pb';
import * as biz_rpc from '../signal/_proto/library/biz/biz_pb_service';
import { EventEmitter } from 'events';
import { Uint8ArrayToString } from '../signal/utils';

export interface JoinResult {
    success: boolean;
    reason: string;
}

export enum PeerState {
    NONE,
    JOIN,
    UPDATE,
    LEAVE,
}

export interface Peer {
    uid: string;
    sid: string;
    info: Map<string, any>;
}

export interface PeerEvent {
    state: PeerState;
    peer: Peer;
}

export enum StreamState {
    NONE,
    ADD,
    REMOVE,
}

export interface StreamEvent {
    uid: string;
    state: StreamState;
    streams: Stream[];
}

export interface Track {
    id: string;
    label: string;
    kind: string;
    simulcast: Map<string, string>;
}

export interface Stream {
    id: string;
    tracks: Track[];
}

export interface Message {
    from: string;
    to: string;
    data: Map<string, any>;
}

export class IonAppBiz implements IonService {
    connector: IonBaseConnector;
    closed: boolean;
    _biz?: IonBizGRPCClient;
    onerror?: (err: Event) => void;
    onjoin?: (success: boolean, reason: string) => void;
    onleave?: (reason: string) => void;
    onpeerevent?: (ev: PeerEvent) => void;
    onstreamevent?: (ev: StreamEvent) => void;
    onmessage?: (msg: Message) => void;

    constructor(connector: IonBaseConnector) {
        this.closed = true;
        this.connector = connector;
        this.connector.registerService("biz", this);
    }

    async join(
        sid: string,
        uid: string,
        info: Map<string, any>): Promise<JoinResult | undefined> {
        this.connect();
        return this._biz?.join(sid, uid, info);
    }

    async leave(uid: string): Promise<string | undefined> {
        return this._biz?.leave(uid);
    }

    async message(from: string, to: string, data: Map<string, any>): Promise<void> {
        return this._biz?.sendMessage(from, to, data);
    }

    connect(): void {
        if (!this._biz) {
            this._biz = new IonBizGRPCClient(this.connector);
            this._biz.onHeaders = (headers: grpc.Metadata) =>
                this.onHeadersHandler?.call(this, headers);
            this._biz.onEnd = (status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) =>
                this.onEndHandler?.call(this, status, statusMessage, trailers);

            this._biz.on("join-reply", async (success: boolean, reason: string) => {
                this.onjoin?.call(this, success, reason);
            });
            this._biz.on("leave-reply", (reason: string) => this.onleave?.call(this, reason));
            this._biz.on("peer-event", (ev: PeerEvent) => this.onpeerevent?.call(this, ev));
            this._biz.on("stream-event", (ev: StreamEvent) => this.onstreamevent?.call(this, ev));
            this._biz.on("message", (msg: Message) => this.onmessage?.call(this, msg));
        }
    }

    close(): void {
        if (this._biz) {
            this._biz.close();
        }
    }

    onHeadersHandler?: (headers: grpc.Metadata) => void;
    onHeaders(handler: (headers: BrowserHeaders) => void): void {
        this.onHeadersHandler = handler;
    };
    onEndHandler?: (status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => void;
    onEnd(handler: (status: Code, statusMessage: string, trailers: BrowserHeaders) => void): void {
        this.onEndHandler = handler;
    }
}

class IonBizGRPCClient extends EventEmitter {
    connector: IonBaseConnector;
    protected client: grpc.Client<biz.SignalRequest, biz.SignalReply>;
    onHeaders?: (headers: grpc.Metadata) => void;
    onEnd?: (status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => void;

    constructor(connector: IonBaseConnector) {
        super();
        this.connector = connector;
        const client = grpc.client(biz_rpc.Biz.Signal, connector.grpcClientRpcOptions()) as grpc.Client<biz.SignalRequest, biz.SignalReply>;
        client.onHeaders((headers: grpc.Metadata) => this.onHeaders?.call(this, headers));
        client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => this.onEnd?.call(this, status, statusMessage, trailers));

        client.onMessage((reply: biz.SignalReply) => {
            switch (reply.getPayloadCase()) {
                case biz.SignalReply.PayloadCase.JOINREPLY:
                    const result = { success: reply.getJoinreply()?.getSuccess() || false, reason: reply.getJoinreply()?.getReason() || "unkown reason" };
                    this.emit('join-reply', result.success, result.reason);
                    break;
                case biz.SignalReply.PayloadCase.LEAVEREPLY:
                    const reason = reply.getLeavereply()?.getReason() || "unkown reason";
                    this.emit('leave-reply', reason);
                    break;
                case biz.SignalReply.PayloadCase.PEEREVENT:
                    {
                        const evt = reply.getPeerevent();
                        let state = PeerState.NONE;
                        const info = JSON.parse(Uint8ArrayToString(evt?.getPeer()?.getInfo() as Uint8Array));
                        switch (evt?.getState()) {
                            case ion.PeerEvent.State.JOIN:
                                state = PeerState.JOIN;
                                break;
                            case ion.PeerEvent.State.UPDATE:
                                state = PeerState.UPDATE;

                                break;
                            case ion.PeerEvent.State.LEAVE:
                                state = PeerState.LEAVE;
                                break;
                        }
                        const peer = {
                            uid: evt?.getPeer()?.getUid() || "",
                            sid: evt?.getPeer()?.getSid() || "",
                            info: info || {},
                        }
                        this.emit("peer-event", { state, peer });
                    }
                    break;
                case biz.SignalReply.PayloadCase.STREAMEVENT:
                    {
                        const evt = reply.getStreamevent();
                        let state = StreamState.NONE;
                        switch (evt?.getState()) {
                            case ion.StreamEvent.State.ADD:
                                state = StreamState.ADD;
                                break;
                            case ion.StreamEvent.State.REMOVE:
                                state = StreamState.REMOVE;
                                break;
                        };
                        const sid = evt?.getSid() || "";
                        const uid = evt?.getUid() || "";
                        const streams = Array<any>();
                        evt?.getStreamsList().forEach((ionStream: ion.Stream) => {
                            const tracks = Array<any>();
                            ionStream.getTracksList().forEach((ionTrack: ion.Track) => {
                                const track = {
                                    id: ionTrack.getId(),
                                    label: ionTrack.getLabel(),
                                    kind: ionTrack.getKind(),
                                    simulcast: ionTrack.getSimulcastMap(),
                                }
                                tracks.push(track);
                            });
                            const stream = {
                                id: ionStream.getId(),
                                tracks: tracks || [],
                            }
                            streams.push(stream);
                        });
                        this.emit("stream-event", { state, sid, uid, streams });
                    }
                    break;
                case biz.SignalReply.PayloadCase.MSG:
                    const data = JSON.parse(Uint8ArrayToString(reply.getMsg()?.getData() as Uint8Array));
                    const msg = { from: reply.getMsg()?.getFrom() || "", to: reply.getMsg()?.getTo() || "", data: data || {} };
                    this.emit('message', msg);
                    break;
            }
        });

        this.client = client;
        this.client.start(connector.metadata);
    }

    async join(sid: string, uid: string, info: Map<string, any>): Promise<JoinResult> {
        const request = new biz.SignalRequest();
        const join = new biz.Join();
        const peer = new ion.Peer();
        peer.setSid(sid);
        peer.setUid(uid);

        const buffer = Uint8Array.from(JSON.stringify(info), (c) => c.charCodeAt(0));
        peer.setInfo(buffer);

        join.setPeer(peer);
        request.setJoin(join);

        this.client.send(request);

        return new Promise<JoinResult>((resolve, reject) => {
            const handler = (result: JoinResult) => {
                resolve(result);
                this.removeListener('join-reply', handler);
            };
            this.addListener('join-reply', handler);
        });
    }

    async leave(uid: string) {
        const request = new biz.SignalRequest();
        const leave = new biz.Leave();
        leave.setUid(uid);
        request.setLeave(leave);

        this.client.send(request);

        return new Promise<string>((resolve, reject) => {
            const handler = (reason: string) => {
                resolve(reason);
                this.removeListener('join-reply', handler);
            };
            this.addListener('join-reply', handler);
        });
    }

    async sendMessage(from: string, to: string, data: Map<string, any>) {
        const request = new biz.SignalRequest();
        const message = new ion.Message();
        message.setFrom(from);
        message.setTo(to);
        const buffer = Uint8Array.from(JSON.stringify(data), (c) => c.charCodeAt(0));
        message.setData(buffer);
        request.setMsg(message);
        this.client.send(request);
    }

    close() {
        this.client.finishSend();
    }
}