import { grpc } from '@improbable-eng/grpc-web';
import { EventEmitter } from 'events';
import { JoinReply, JoinRequest } from './signal/_proto/library/biz/biz_pb';
import { BidirectionalStream, BizClient } from './signal/_proto/library/biz/biz_pb_service';

export interface JoinResult {
    success: boolean;
    reason: string;
  }

export interface PeerEvent {

}

export interface StreamEvent {
    
}

export interface Message {
    from: string;
    to: string;
    data: any;
}

export default class BIZ {
    protected client: BizClient;
    protected streaming: BidirectionalStream<JoinRequest, JoinReply>;
    private _event: EventEmitter;

    constructor(uri: string) {
        this._event = new EventEmitter();
        this.client = new BizClient(uri, {
          transport: grpc.WebsocketTransport(),
        });

        this.streaming = this.client.join();
        this.streaming.on('data', (reply: JoinReply) => {
            switch (reply.getPayloadCase()) {
                case JoinReply.PayloadCase.RESULT:
                    var result = {success: reply.getResult()?.getSuccess(), reason: reply.getResult()?.getReason()};
                    this._event.emit('join-result', result);
                break;
                case JoinReply.PayloadCase.PEEREVENT:
                    var event = {};
                    this._event.emit('peer-event', event);
                break;
                case JoinReply.PayloadCase.STREAMEVENT:
                    var event = {};
                    this._event.emit('stream-event', event);
                break;
            }
        });
    }
    async join(sid: string, uid: string, info: any, token: string): Promise<JoinResult> {
        return {success: false, reason: 'not yet implemented'};
    }

    async leave(uid: string) {

    }

    async send(msg: Message) {
        
    }

    onpeerevent?: (event: PeerEvent) => void;

    onstreamevent?: (event: StreamEvent) => void;

    onmessage?:(msg: Message) => void;
}