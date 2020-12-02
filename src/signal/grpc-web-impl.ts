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
                    const answer = JSON.parse(Uint8ArrayToString(reply.getJoin()?.getDescription() as Uint8Array));
                    this._event.emit('join-reply', answer);
                    break;
                case SignalReply.PayloadCase.DESCRIPTION:
                    const desc = JSON.parse(Uint8ArrayToString(reply.getDescription() as Uint8Array));
                    if (desc.type === 'offer') {
                        if (this.onnegotiate) this.onnegotiate(desc);
                    } else if (desc.type === 'answer') {
                        this._event.emit('description', desc);
                    }
                    break;
                case SignalReply.PayloadCase.TRICKLE:
                    const pbTrickle = reply.getTrickle();
                    if (pbTrickle?.getInit() !== undefined) {
                        const candidate = JSON.parse(pbTrickle.getInit() as string);
                        const trickle = { target: pbTrickle.getTarget(), candidate: {candidate}};
                        if (this.ontrickle) this.ontrickle(trickle as Trickle);
                    }
                    break;
                case SignalReply.PayloadCase.ICECONNECTIONSTATE:
                case SignalReply.PayloadCase.ERROR:
                    break;
            }
        });

        // this.streaming.on('end' || 'status', (status?: Status | undefined) => {});
    }

    join(sid: string, offer: RTCSessionDescriptionInit) {
        const request = new SignalRequest();
        const join = new JoinRequest();
        join.setSid(sid);
        const buffer = Uint8Array.from(JSON.stringify(offer), c => c.charCodeAt(0));
        join.setDescription(buffer);
        request.setJoin(join);
        this.streaming.write(request);

        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (desc: RTCSessionDescriptionInit) => {
                resolve({ type: "answer", sdp: desc.sdp });
                this._event.removeListener('join-reply', handler);
            };
            this._event.addListener('join-reply', handler);
        });
    }

    trickle(trickle: Trickle) {
        const request = new SignalRequest();
        const pbTrickle = new pb.Trickle();
        pbTrickle.setInit(JSON.stringify(trickle.candidate));
        request.setTrickle(pbTrickle);
        this.streaming.write(request);
    }

    offer(offer: RTCSessionDescriptionInit) {
        const id = uuidv4();
        const request = new SignalRequest();
        const buffer = Uint8Array.from(JSON.stringify(offer), c => c.charCodeAt(0));
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
        const request = new SignalRequest();
        const buffer = Uint8Array.from(JSON.stringify(answer), c => c.charCodeAt(0));
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
    let dataString = "";
    for (const element of  dataArray) {
      dataString += String.fromCharCode(element);
    }
    return dataString
}
