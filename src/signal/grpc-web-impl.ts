import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Signal } from '.';
import { grpc } from "@improbable-eng/grpc-web";
import { SFUClient, Status, BidirectionalStream } from "./_proto/library/sfu_pb_service";
import { SignalRequest, SignalReply, JoinRequest, JoinReply } from "./_proto/library/sfu_pb";
import * as pb from "./_proto/library/sfu_pb";
import { Trickle } from '../client';

export default class IonSFUGRPCWebSignal implements Signal {
    protected client: SFUClient;
    protected streaming: BidirectionalStream<SignalRequest, SignalReply>;
    private _event: EventEmitter;
    private _onready?: () => void;
    private _onerror?: (error: Event) => void;
    onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
    ontrickle?: (trickle: Trickle) => void;

    constructor(uri: string) {
        this._event = new EventEmitter();
        this.client = new SFUClient(uri, {
            transport: grpc.WebsocketTransport(),
        });

        this.streaming = this.client.signal();

        this.streaming.on('data', (reply: SignalReply) => {
            switch (reply.getPayloadCase()) {
                case SignalReply.PayloadCase.JOIN:
                    this._event.emit('join', reply.getJoin());
                    break;
                case SignalReply.PayloadCase.DESCRIPTION:
                    var desc = JSON.parse(Uint8ArrayToString(reply.getDescription() as Uint8Array));
                    if (desc.type === 'offer') {
                        if (this.onnegotiate) this.onnegotiate(desc);
                    } else if (desc.type === 'answer') {
                        this._event.emit('description', desc);
                    }
                case SignalReply.PayloadCase.TRICKLE:
                    var pbTrickle = reply.getTrickle();
                    if( pbTrickle?.getInit() !== undefined) {
                        var candidate = JSON.parse(pbTrickle?.getInit() as string);
                        var trickle = { target: pbTrickle?.getTarget(), candidate: candidate};
                        if (this.ontrickle) this.ontrickle(trickle as Trickle);
                    }
                    break;
                case SignalReply.PayloadCase.ICECONNECTIONSTATE:
                    console.log('ice connect state' + reply.getIceconnectionstate());
                    break;
                case SignalReply.PayloadCase.ERROR:
                    console.log('error: ' + reply.getError());
                    //if (this._onerror) this._onerror(reply.getError());
                    break;
            }
        });

        this.streaming.on('end' || 'status', (status?: Status | undefined) => {
            console.log(status);
            //if (this._onerror) this._onerror(status?.details);
        });
    }

    join(sid: string, offer: RTCSessionDescriptionInit) {
        var request = new SignalRequest();
        var join = new JoinRequest();
        join.setSid(sid);
        var buffer = Uint8Array.from(JSON.stringify(offer), c => c.charCodeAt(0));
        join.setDescription(buffer);
        request.setJoin(join);
        this.streaming.write(request);

        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (desc: RTCSessionDescriptionInit) => {
                resolve({ type: "answer", sdp: desc.sdp });
                this._event.removeListener('description', handler);
            };
            this._event.addListener('description', handler);
        });
    }

    trickle(trickle: Trickle) {
        var request = new SignalRequest();
        var pbTrickle = new pb.Trickle();
        pbTrickle.setInit(JSON.stringify(trickle.candidate));
        request.setTrickle(pbTrickle);
        this.streaming.write(request);
    }

    offer(offer: RTCSessionDescriptionInit) {
        const id = uuidv4();
        var request = new SignalRequest();
        var buffer = Uint8Array.from(JSON.stringify(offer), c => c.charCodeAt(0));
        request.setDescription(buffer);
        this.streaming.write(request);

        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (desc: RTCSessionDescriptionInit) => {
                resolve({ type: "answer", sdp: desc.sdp });
                this._event.removeListener('description', handler);
            };
            this._event.addListener('description', handler);
        });
    }

    answer(answer: RTCSessionDescriptionInit) {
        var request = new SignalRequest();
        var buffer = Uint8Array.from(JSON.stringify(answer), c => c.charCodeAt(0));
        request.setDescription(buffer);
        this.streaming.write(request);
    }

    close() {
        this.streaming.end();
    }

    set onready(onready: () => void) {
        if (this.streaming !== undefined) {
            onready();
        }
        this._onready = onready;
    }
    set onerror(onerror: (error: Event) => void) {
        this._onerror = onerror;
    }
}

function Uint8ArrayToString(dataArray: Uint8Array) {
    var dataString = "";
    for (var i = 0; i < dataArray.length; i++) {
      dataString += String.fromCharCode(dataArray[i]);
    }
    return dataString
}
