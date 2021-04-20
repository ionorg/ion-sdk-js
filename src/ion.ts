import Client, { Configuration } from './client';
import { LocalStream, RemoteStream, Constraints } from './stream';
import { BizClient } from './signal/biz';
import { IonSFUGRPCWebSignal } from './signal/grpc-web-impl';
import { Signal, Trickle } from './signal';
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
    simulcast: Map<string,string>;
}

export interface Stream {
    id: string;
	tracks: Track[];
}

export interface Message {
    from: string ;
    to: string;
    data: Map<string, any>;
}

export class IonConnector {
    private _biz: BizClient;
    private _sfu: Client | undefined;
    private _sid: string;
    private _uid: string;

    onerror?:(err: Error) => void;

    onjoin?:(success: boolean, reason: string) => void;

    onleave?:(reason: string) => void;

    onpeerevent?: (ev: PeerEvent) => void;

    onstreamevent?: (ev: StreamEvent) => void;

    onmessage?:(msg: Message) => void;

    ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

    ondatachannel?: (ev: RTCDataChannelEvent) => void;

    onspeaker?: (ev: string[]) => void;

    constructor(url: string, config?: Configuration) {
        this._sid = "";
        this._uid = "";
        this._sfu = undefined;
        this._biz = new BizClient(url);
      
        this._biz.on("join-reply", async (success: boolean, reason: string) => {
            if (this.onjoin) {
                this.onjoin(success, reason);
            }
            if (success && !this._sfu) {
                const signal = new IonSFUGRPCWebSignal(url);
                const sfu = new Client(signal, config);

                sfu.ontrack =   (track: MediaStreamTrack, stream: RemoteStream) => 
                                                this.ontrack?.call(this, track, stream);
                sfu.ondatachannel = (ev: RTCDataChannelEvent) =>
                                                this.ondatachannel?.call(this, ev);
                sfu.onspeaker = (ev: string[]) => this.onspeaker?.call(this, ev);

                this._sfu = sfu;

                await sfu.join(this._sid, this._uid);
            }
        });

        this._biz.on("leave-reply", (reason: string) => {
            if (this.onleave) {
                this.onleave(reason);
            }
        });

        this._biz.on("peer-event", (ev: PeerEvent) => {
            if(this.onpeerevent) {
                this.onpeerevent(ev);
            }
        })

        this._biz.on("stream-event", (ev: StreamEvent) => {
            if(this.onstreamevent) {
                this.onstreamevent(ev);
            }
        })

        this._biz.on("message", (msg: Message) => {
            if(this.onmessage) {
                this.onmessage(msg);
            }
        })
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