import Client, { Configuration } from './client';
import { LocalStream, RemoteStream, Constraints } from './stream';
import { BizClient } from './signal/biz';
import { IonSFUGRPCWebSignal } from './signal/grpc-web-impl';
import { Signal, Trickle } from './signal';
import { grpc } from '@improbable-eng/grpc-web';

export { Client, LocalStream, RemoteStream, Constraints, Signal, Trickle };

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

export class IonConnector {
    private _biz: BizClient;
    private _sfu: Client | undefined;
    private _sid: string;
    private _uid: string;
    private _metadata: grpc.Metadata;

    onerror?: (err: Event) => void;

    onjoin?: (success: boolean, reason: string) => void;

    onleave?: (reason: string) => void;

    onpeerevent?: (ev: PeerEvent) => void;

    onstreamevent?: (ev: StreamEvent) => void;

    onmessage?: (msg: Message) => void;

    ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

    ondatachannel?: (ev: RTCDataChannelEvent) => void;

    onspeaker?: (ev: string[]) => void;

    constructor(url: string, token?: string, config?: Configuration) {
        this._sid = "";
        this._uid = "";
        this._sfu = undefined;
        this._metadata = new grpc.Metadata();

        if (token) {
            this._metadata.append("authorization", token);
        }

        this._biz = new BizClient(url, this._metadata);

        this._biz.onHeaders = (headers: grpc.Metadata) => {
            headers.forEach((key,value) => {
                if(key !== "trailer" && key !== "content-type") {
                    this._metadata.append(key, value);
                }
            });
        }

        this._biz.onEnd = (status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => {
            this.onerror?.call(this, new CustomEvent("biz", { "detail": {status, statusMessage}}));
        }

        this._biz.on("join-reply", async (success: boolean, reason: string) => {
            this.onjoin?.call(this, success, reason);

            if (success && !this._sfu) {
                const signal = new IonSFUGRPCWebSignal(url, this._metadata);
                this._sfu = new Client(signal, config);
                this._sfu.ontrack = (track: MediaStreamTrack, stream: RemoteStream) =>
                    this.ontrack?.call(this, track, stream);
                this._sfu.ondatachannel = (ev: RTCDataChannelEvent) =>
                    this.ondatachannel?.call(this, ev);
                this._sfu.onspeaker = (ev: string[]) => this.onspeaker?.call(this, ev);
                await this._sfu.join(this._sid, this._uid);
            }
        });

        this._biz.on("leave-reply", (reason: string) => this.onleave?.call(this, reason));
        this._biz.on("peer-event", (ev: PeerEvent) => this.onpeerevent?.call(this, ev));
        this._biz.on("stream-event", (ev: StreamEvent) => this.onstreamevent?.call(this, ev));
        this._biz.on("message", (msg: Message) => this.onmessage?.call(this, msg));
    }

    get sfu() { return this._sfu; }

    async join(sid: string, uid: string, info: Map<string, any>, token: string | undefined): Promise<JoinResult> {
        this._sid = sid;
        this._uid = uid;
        return this._biz.join(sid, uid, info, token);
    }

    async leave(uid: string): Promise<string> {
        return this._biz.leave(uid)
    }

    async message(from: string, to: string, data: Map<string, any>): Promise<void> {
        return this._biz.sendMessage(from, to, data);
    }

    close() {
        this._sfu?.close();
        this._biz.close();
    }
}