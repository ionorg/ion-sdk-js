import { grpc } from '@improbable-eng/grpc-web';
import { EventEmitter } from 'events';
import * as biz from './_proto/library/biz/biz_pb';
import * as ion from './_proto/library/biz/ion_pb';
import * as biz_rpc from './_proto/library/biz/biz_pb_service';
import { JoinResult, PeerState, StreamState, Message } from '../ion';
import { Uint8ArrayToString } from './utils';

export class BizClient extends EventEmitter {
    protected client: biz_rpc.BizClient;
    protected streaming: biz_rpc.BidirectionalStream<biz.SignalRequest, biz.SignalReply>;

    constructor(uri: string) {
        super();
        this.client = new biz_rpc.BizClient(uri, {
          transport: grpc.WebsocketTransport(),
        });

        this.streaming = this.client.signal();
        this.streaming.on('data', (reply: biz.SignalReply) => {
            switch (reply.getPayloadCase()) {
                case biz.SignalReply.PayloadCase.JOINREPLY:
                    const result = {success: reply.getJoinreply()?.getSuccess() || false, reason: reply.getJoinreply()?.getReason() || "unkown reason"};
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
                    const  info = JSON.parse(Uint8ArrayToString(evt?.getPeer()?.getInfo() as Uint8Array));
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
                    const peer = {
                        uid: evt?.getPeer()?.getUid() || "",
                        sid: evt?.getPeer()?.getSid() || "",
                        info: info || {},
                    }
                    this.emit("peer-event", {state, peer});
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
                    this.emit("stream-event", {state, sid, uid, streams});
                }
                break;
                case biz.SignalReply.PayloadCase.MSG:
                    const data = JSON.parse(Uint8ArrayToString(reply.getMsg()?.getData() as Uint8Array));
                    const msg = {from: reply.getMsg()?.getFrom() || "", to: reply.getMsg()?.getTo() || "", data: data || {}};
                    this.emit('message', msg);
                break;
            }
        });
    }


    async join(sid: string, uid: string, info: Map<string, any>, token: string | undefined): Promise<JoinResult> {
        const request = new biz.SignalRequest();
        const join = new biz.Join();
        join.setToken(token || '');
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

        this.streaming.write(request);

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
        this.streaming.write(request);
    }

    close () {
        this.streaming.end();
    }
}