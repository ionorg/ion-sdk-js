import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Signal } from './';
import { grpc } from "@improbable-eng/grpc-web";
import { SFUClient, Status, BidirectionalStream } from "./_proto/library/sfu_pb_service";
import { SignalRequest, SignalReply, JoinRequest, JoinReply, Trickle, SessionDescription } from "./_proto/library/sfu_pb";

export default class IonSFUgRPCWebSignal implements Signal {
    protected client: SFUClient;
    protected streaming: BidirectionalStream<SignalRequest, SignalReply>;
    private _event: EventEmitter;
    private _onready?: () => void;
    private _onerror?: (error: Event) => void;
    onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
    ontrickle?: (candidate: RTCIceCandidateInit) => void;

    constructor(uri: string) {
        this._event = new EventEmitter();
        this.client = new SFUClient(uri, {
            transport: grpc.WebsocketTransport(),
        });

        this.streaming = this.client.signal();

        this.streaming.on('data', (message: SignalReply) => {
            switch (message.getPayloadCase()) {
                case SignalReply.PayloadCase.JOIN:
                    this._event.emit('join', message.getJoin());
                    break;
                case SignalReply.PayloadCase.NEGOTIATE:
                    var desc = message.getNegotiate();
                    var type = desc?.getType();
                    switch (type) {
                        case "offer":
                            this._event.emit('offer', desc);
                            if (this.onnegotiate)
                                this.onnegotiate({ type: "offer", sdp: desc?.getSdp() as string });
                            break;
                        case "answer":
                            this._event.emit('answer', desc);
                            if (this.onnegotiate)
                                this.onnegotiate({ type: "answer", sdp: desc?.getSdp() as string });
                            break;
                    }
                    break;
                    break;
                case SignalReply.PayloadCase.TRICKLE:
                    this._event.emit('trickle', message.getTrickle());
                    break;
            }
        });

        this.streaming.on('end' || 'status', (status?: Status | undefined) => {

        });

        /*
        this.socket.addEventListener('open', () => {
            if (this._onready) this._onready();
        });

        this.socket.addEventListener('error', (e) => {
            if (this._onerror) this._onerror(e);
        });
        */
    }

    join(sid: string, offer: RTCSessionDescriptionInit) {
        var request = new SignalRequest();
        var join = new JoinRequest();
        join.setSid(sid);

        var desc = new SessionDescription();
        desc.setType(offer.type as string);
        desc.setSdp(offer.sdp as string);

        join.setOffer(desc);
        request.setJoin(join);
        this.streaming.write(request);

        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (resp: JoinReply) => {
                var answer = resp.getAnswer();
                resolve({ type: "answer", sdp: answer?.getSdp() as string });
                this._event.removeListener('join', handler);
            };
            this._event.addListener('join', handler);
        });
    }

    trickle(candidate: RTCIceCandidateInit) {
        var request = new SignalRequest();
        var trickle = new Trickle();
        trickle.setInit(candidate.toString());
        request.setTrickle(trickle);
        this.streaming.write(request);
    }

    offer(offer: RTCSessionDescriptionInit) {
        const id = uuidv4();
        var request = new SignalRequest();
        var desc = new SessionDescription();
        desc.setType(offer.type as string);
        desc.setSdp(offer.sdp as string);
        request.setNegotiate(desc);
        this.streaming.write(request);

        return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
            const handler = (desc: SessionDescription) => {
                resolve({ type: "answer", sdp: desc?.getSdp() as string });
                this._event.removeListener('answer', handler);
            };
            this._event.addListener('answer', handler);
        });
    }

    answer(answer: RTCSessionDescriptionInit) {
        var request = new SignalRequest();
        var desc = new SessionDescription();
        desc.setType(answer.type as string);
        desc.setSdp(answer.sdp as string);
        request.setNegotiate(desc);
        this.streaming.write(request);
    }

    close() {
        this.streaming.end();
    }

    set onready(onready: () => void) {
        onready();
        this._onready = onready;
    }
    set onerror(onerror: (error: Event) => void) {
        this._onerror = onerror;
    }
}
