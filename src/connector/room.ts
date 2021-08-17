import { grpc } from '@improbable-eng/grpc-web';
import { IonService, IonBaseConnector } from './ion';
import * as room from '../_library/apps/room/proto/room_pb';
import * as room_rpc from '../_library/apps/room/proto/room_pb_service';
import { EventEmitter } from 'events';
import { Uint8ArrayToJSONString } from './utils';

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

export interface Role {
    HOST: 0;
    GUEST: 1;
}

export interface Protocol {
    PROTOCOLUNKNOWN: 0;
    WEBRTC: 1;
    SIP: 2;
    RTMP: 3;
    RTSP: 4;
}

export interface ErrorType {
    NONE: 0;
    UNKOWNERROR: 1;
    PERMISSIONDENIED: 2;
    SERVICEUNAVAILABLE: 3;
    ROOMLOCKED: 4;
    PASSWORDREQUIRED: 5;
    ROOMALREADYEXIST: 6;
    ROOMNOTEXIST: 7;
    INVALIDPARAMS: 8;
    PEERALREADYEXIST: 9;
    PEERNOTEXIST: 10;
}

export interface Direction {
    INCOMING: 0;
    OUTGOING: 1;
    BILATERAL: 2;
}

export interface Peer {
    sid: string,
    uid: string,
    displayname: string,
    extrainfo: Uint8Array | string,
    destination: string,
    role: Role,
    protocol: Protocol,
    avatar: string,
    direction: Direction,
    vendor: string,
}

export interface PeerEvent {
    state: PeerState;
    peer: Peer;
}

export interface Message {
    from: string;
    to: string;
    data: Map<string, any>;
}

export class IonAppRoom implements IonService {
    name: string;
    connector: IonBaseConnector;
    connected: boolean;
    _rpc?: _IonRoomGRPCClient;
    onerror?: (err: Event) => void;
    onjoin?: (success: boolean, reason: string) => void;
    onleave?: (reason: string) => void;
    onpeerevent?: (ev: PeerEvent) => void;
    onmessage?: (msg: Message) => void;

    constructor(connector: IonBaseConnector) {
        this.name = "room";
        this.connected = false;
        this.connector = connector;
        this.connector.registerService(this);
    }

    async join(
        sid: string,
        uid: string,
        info: Map<string, any>): Promise<JoinResult | undefined> {
        return this._rpc?.join(sid, uid);
    }

    async leave(uid: string): Promise<string | undefined> {
        return this._rpc?.leave(uid);
    }

    async message(from: string, to: string, data: Map<string, any>): Promise<void> {
        return this._rpc?.sendMessage(from, to, data);
    }

    connect(): void {
        if (!this._rpc) {
            this._rpc = new _IonRoomGRPCClient(this, this.connector);
            this._rpc.on("join-reply", async (success: boolean, reason: string) => {
                this.onjoin?.call(this, success, reason);
            });
            this._rpc.on("leave-reply", (reason: string) => this.onleave?.call(this, reason));
            this._rpc.on("peer-event", (ev: PeerEvent) => this.onpeerevent?.call(this, ev));
            this._rpc.on("message", (msg: Message) => this.onmessage?.call(this, msg));
        }
    }

    close(): void {
        if (this._rpc) {
            this._rpc.close();
        }
    }
}

class _IonRoomGRPCClient extends EventEmitter {
    connector: IonBaseConnector;
    protected _client: grpc.Client<room.Request, room.Reply>;
    constructor(service: IonService, connector: IonBaseConnector) {
        super();
        this.connector = connector;
        const client = grpc.client(room_rpc.RoomSignal.Signal, connector.grpcClientRpcOptions()) as grpc.Client<room.Request, room.Reply>;

        client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) =>
            connector.onEnd(service, status, statusMessage, trailers));
        client.onHeaders((headers: grpc.Metadata) => connector.onHeaders(service, headers));

        client.onMessage((reply: room.Reply) => {
            switch (reply.getPayloadCase()) {
                case room.Reply.PayloadCase.JOIN:
                    const result = { success: reply.getJoin()?.getSuccess() || false, reason: reply.getJoin()?.getError()?.getReason() || "unkown reason" };
                    this.emit('join-reply', result.success, result.reason);
                    break;
                case room.Reply.PayloadCase.LEAVE:
                    const reason = reply.getLeave()?.getError()?.getReason() || "unkown reason";
                    this.emit('leave-reply', reason);
                    break;
                case room.Reply.PayloadCase.PEER:
                    const evt = reply.getPeer();
                    let state = PeerState.NONE;
                    switch (evt?.getState()) {
                        case room.PeerState.JOIN:
                            state = PeerState.JOIN;
                            break;
                        case room.PeerState.UPDATE:
                            state = PeerState.UPDATE;
                            break;
                        case room.PeerState.LEAVE:
                            state = PeerState.LEAVE;
                            break;
                    }
                    const peer = {
                        uid: evt?.getPeer()?.getUid() || "",
                        sid: evt?.getPeer()?.getSid() || "",
                        displayname: evt?.getPeer()?.getDisplayname() || "",
                        extrainfo: evt?.getPeer()?.getExtrainfo() || "",
                        destination: evt?.getPeer()?.getDestination() || "",
                        role: evt?.getPeer()?.getRole() || "",
                        protocol: evt?.getPeer()?.getProtocol() || "",
                        avatar: evt?.getPeer()?.getAvatar() || "",
                        direction: evt?.getPeer()?.getDirection() || "",
                        vendor: evt?.getPeer()?.getVendor() || "",
                    }
                    this.emit("peer-event", { state, peer });

                    break;
                case room.Reply.PayloadCase.MESSAGE:
                    const data = JSON.parse(Uint8ArrayToJSONString(reply.getMessage()?.getPayload() as Uint8Array));
                    const msg = { from: reply.getMessage()?.getFrom() || "", to: reply.getMessage()?.getTo() || "", data: data || {} };
                    this.emit('message', msg);
                    break;
            }
        });

        this._client = client;
        this._client.start(connector.metadata);
    }

    async join(sid: string, uid: string, ): Promise<JoinResult> {
        const request = new room.Request();
        const join = new room.JoinRequest();
        const peer = new room.Peer();
        peer.setSid(sid);
        peer.setUid(uid);
        //TODO: add more info

        request.setJoin(join);

        this._client.send(request);

        return new Promise<JoinResult>((resolve, reject) => {
            const handler = (result: JoinResult) => {
                resolve(result);
                this.removeListener('join-reply', handler);
            };
            this.addListener('join-reply', handler);
        });
    }

    async leave(uid: string) {
        const request = new room.Request();
        const leave = new room.LeaveRequest();
        leave.setUid(uid);
        request.setLeave(leave);

        this._client.send(request);

        return new Promise<string>((resolve, reject) => {
            const handler = (reason: string) => {
                resolve(reason);
                this.removeListener('join-reply', handler);
            };
            this.addListener('join-reply', handler);
        });
    }

    async sendMessage(from: string, to: string, data: Map<string, any>) {
        const request = new room.Request();
        const sendMessage = new room.SendMessageRequest();
        const message = new room.Message();
        message.setFrom(from);
        message.setTo(to);
        const buffer = Uint8Array.from(JSON.stringify(data), (c) => c.charCodeAt(0));
        message.setPayload(buffer);
        request.setSendmessage(sendMessage);
        this._client.send(request);
    }

    close() {
        this._client.finishSend();
    }
}