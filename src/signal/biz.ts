import { grpc } from '@improbable-eng/grpc-web';
import { EventEmitter } from 'events';
import * as biz from './_proto/library/biz/biz_pb';
import * as ion from './_proto/library/biz/ion_pb';
import { BidirectionalStream, BizClient } from './_proto/library/biz/biz_pb_service';

export interface JoinResult {
    success: boolean;
    reason: string;
  }

enum PeerState {
    NONE,
    JOIN,
    UPDATE,
    LEAVE,
}

export interface Peer {
    uid: string;
    sid: string;
    info: any;
}

export interface PeerEvent {
    state: PeerState;
    peer: Peer;
}

enum StreamState {
    NONE,
    ADD,
    REMOVE,
}

export interface StreamEvent {
    uid: string;
    state: StreamState;
    streams: Array<Stream>;
}

export interface Track {
    id: string;
    label: string;
    kind: string;
    simulcast: Map<string,string>;
}

export interface Stream {
    id: string;
	tracks: Array<Track>;
}

export interface Message {
    from: string ;
    to: string;
    data: any;
}

export class BIZ {
    protected client: BizClient;
    protected streaming: BidirectionalStream<biz.SignalRequest, biz.SignalReply>;
    private _event: EventEmitter;

    constructor(uri: string) {
        this._event = new EventEmitter();
        this.client = new BizClient(uri, {
          transport: grpc.WebsocketTransport(),
        });

        this.streaming = this.client.signal();
        this.streaming.on('data', (reply: biz.SignalReply) => {
            switch (reply.getPayloadCase()) {
                case biz.SignalReply.PayloadCase.JOINREPLY:
                    var result = {success: reply.getJoinreply()?.getSuccess() || false, reason: reply.getJoinreply()?.getReason() || "unkown reason"};
                    this._event.emit('join-reply', result);
                    if (this.onjoin) {
                        this.onjoin(result.success, result.reason);
                    }
                break;
                case biz.SignalReply.PayloadCase.LEAVEREPLY:
                    const reason = reply.getLeavereply()?.getReason() || "unkown reason";
                    this._event.emit('leave-reply', reason);
                    if (this.onleave) {
                        this.onleave(reason);
                    }
                break;
                case biz.SignalReply.PayloadCase.PEEREVENT:
                {
                    const evt = reply.getPeerevent();
                    const peer = {
                        uid: evt?.getPeer()?.getUid() || "",
                        sid: evt?.getPeer()?.getSid() || "",
                        info: evt?.getPeer()?.getInfo()
                    }
                    let state = PeerState.NONE;
                    switch(evt?.getState()) {
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
                    if (this.onpeerevent) {
                        this.onpeerevent(state, peer);
                    }
                }
                break;
                case biz.SignalReply.PayloadCase.STREAMEVENT:
                {
                    const evt = reply.getStreamevent();
                    let state = StreamState.NONE;
                    switch(evt?.getState()) {
                        case ion.StreamEvent.State.ADD:
                            state = StreamState.ADD;
                            break;
                        case ion.StreamEvent.State.REMOVE:
                            state = StreamState.REMOVE;
                            break;
                    };
                    const sid = evt?.getSid() || "";
                    const uid = evt?.getUid() || "";
                    let streams = Array<any>();
                    evt?.getStreamsList().forEach((ionStream: ion.Stream) => {
                        let tracks = Array<any>();
                        ionStream.getTracksList().forEach((ionTrack: ion.Track) => {
                            let track = {
                                id: ionTrack.getId(),
                                label: ionTrack.getLabel(),
                                kind: ionTrack.getKind(),
                                simulcast: ionTrack.getSimulcastMap(),
                            }
                            tracks.push(track);
                        });
                        let stream = {
                            id: ionStream.getId(),
                            tracks: tracks,
                        }
                        streams.push(stream);
                    });

                    if (this.onstreamevent) {
                        this.onstreamevent(state, sid, uid, streams);
                    }
                }
                break;
                case biz.SignalReply.PayloadCase.MSG:
                    const msg = {from: reply.getMsg()?.getFrom() || "", to: reply.getMsg()?.getTo() || "", data: reply.getMsg()?.getData()};
                    this._event.emit('message', msg);
                    if (this.onmessage) {
                        this.onmessage(
                            reply.getMsg()?.getFrom() || "",
                            reply.getMsg()?.getTo() || "",
                            reply.getMsg()?.getData());
                    }
                break;
            }
        });
    }


    async join(sid: string, uid: string, info: any, token: string): Promise<JoinResult> {
        const request = new biz.SignalRequest();
        const join = new biz.Join();
        join.setToken(token);

        const peer = new ion.Peer();
        peer.setSid(sid);
        peer.setUid(uid);

        const buffer = Uint8Array.from(JSON.stringify(info), (c) => c.charCodeAt(0));
        peer.setInfo(buffer);

        join.setPeer(peer);
        request.setJoin(join);
        
        this.streaming.write(request);

        return new Promise<JoinResult>((resolve, reject) => {
        const handler = (result: JoinResult) => {
            resolve(result);
            this._event.removeListener('join-reply', handler);
        };
        this._event.addListener('join-reply', handler);
        });
    }

    async leave(uid: string) {
        const request = new biz.SignalRequest();
        const leave = new biz.Leave();
        leave.setUid(uid);
        request.setLeave(leave);

        this.streaming.write(request);

        return new Promise<string>((resolve, reject) => {
            const handler = (reason: string) => {
                resolve(reason);
                this._event.removeListener('join-reply', handler);
            };
            this._event.addListener('join-reply', handler);
        });
    }

    async send(msg: Message) {
        const request = new biz.SignalRequest();
        const message = new ion.Message();
        message.setFrom(msg.from);
        message.setTo(msg.to);
        message.setData(msg.data);
        request.setMsg(message);
        this.streaming.write(request);
    }

    onjoin?:(success: boolean, reason: string) => void;

    onleave?:(reason: string) => void;

    onpeerevent?: (state: PeerState, peer: Peer) => void;

    onstreamevent?: (state: StreamState, sid: string, uid: string, streams: Array<Stream>) => void;

    onmessage?:(from: string, to: string, data: any) => void;
}