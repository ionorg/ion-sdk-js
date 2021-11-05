import { grpc } from '@improbable-eng/grpc-web';
import { Service, Connector } from './ion';
import * as room from '../_library/apps/room/proto/room_pb';
import * as room_rpc from '../_library/apps/room/proto/room_pb_service';
import { EventEmitter } from 'events';

/**
 * PeerState: The state of a peer
 */
export enum PeerState {
    NONE,
    JOIN,
    UPDATE,
    LEAVE,
}

/**
 * Role: Role of the peer
 */
export enum Role {
    HOST = 0,
    GUEST = 1
}
/**
 * Protocol: The protocol of the peer
 */
export enum Protocol {
    PROTOCOLUNKNOWN = 0,
    WEBRTC = 1,
    SIP = 2,
    RTMP = 3,
    RTSP = 4,
}

/**
 * ErrorType: The type of error
 */
export enum ErrorType {
    NONE = 0,
    UNKOWNERROR = 1,
    PERMISSIONDENIED = 2,
    SERVICEUNAVAILABLE = 3,
    ROOMLOCKED = 4,
    PASSWORDREQUIRED = 5,
    ROOMALREADYEXIST = 6,
    ROOMNOTEXIST = 7,
    INVALIDPARAMS = 8,
    PEERALREADYEXIST = 9,
    PEERNOTEXIST = 10,
}

/**
 * Error: The error
 */
export interface Error {
    errType: ErrorType;
    reason: string;
}

/**
 * JoinResult: The result of join
 */
export interface JoinResult {
    success: boolean;
    error: Error;
    role: Role;
    room: RoomInfo;
}

/**
 * Direction: The direction of the stream
 */
export enum Direction {
    INCOMING = 0,
    OUTGOING = 1,
    BILATERAL = 2,
}

/**
 * Peer: The peer interface
 */
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

/**
 * PeerEvent: The event of peer
 */
export interface PeerEvent {
    state: PeerState;
    peer: Peer;
}

/**
 * Message: The message interface
 */
export interface Message {
    from: string;
    to: string;
    type: string;
    payload: any;
}

/**
 * RoomInfo: The room info interface
 */
export interface RoomInfo {
    sid: string,
    name: string,
    lock: boolean,
    password: string,
    description: string,
    maxpeers: number,
}

/**
 * Disconnect: The disconnect interface
 */
export interface Disconnect {
    sid: string,
    reason: string,
}

/**
 * Room: The room class
 */
export class Room implements Service {
    // public
    name: string;
    connector: Connector;
    connected: boolean;
    onerror?: (err: Event) => void;
    onjoin?: (result: JoinResult) => void;
    onleave?: (reason: string) => void;
    onpeerevent?: (ev: PeerEvent) => void;
    onmessage?: (msg: Message) => void;
    onroominfo?: (info: RoomInfo) => void;
    ondisconnect?: (dis: Disconnect) => void;

    constructor(connector: Connector) {
        this.name = "room";
        this.connected = false;
        this.connector = connector;
        this.connector.registerService(this);
        this.connect();
    }

    async join(peer: Peer, password: string | undefined): Promise<JoinResult | undefined> {
        return this._rpc?.join(peer, password);
    }

    async leave(sid: string, uid: string): Promise<string | undefined> {
        return this._rpc?.leave(sid, uid);
    }

    async message(sid: string, from: string, to: string, mineType: string, data: Map<string, any>): Promise<void> {
        return this._rpc?.sendMessage(sid, from, to, mineType, data);
    }

    connect(): void {
        if (!this._rpc) {
            this._rpc = new RoomGRPCClient(this, this.connector);
            this._rpc.on("join-reply", (result: JoinResult) => { this.onjoin?.call(this, result); });
            this._rpc.on("leave-reply", (reason: string) => this.onleave?.call(this, reason));
            this._rpc.on("peer-event", (ev: PeerEvent) => this.onpeerevent?.call(this, ev));
            this._rpc.on("message", (msg: Message) => this.onmessage?.call(this, msg));
            this._rpc.on("room-info", (info: RoomInfo) => this.onroominfo?.call(this, info));
            this._rpc.on("disconnect", (dis: Disconnect) => this.ondisconnect?.call(this, dis));
        }
    }

    close(): void {
        if (this._rpc) {
            this._rpc.close();
        }
    }

    // private
    _rpc?: RoomGRPCClient;
}
/**
 * RoomGRPCClient: The room grpc client
 */
class RoomGRPCClient extends EventEmitter {
    connector: Connector;
    protected _client: grpc.Client<room.Request, room.Reply>;
    constructor(service: Service, connector: Connector) {
        super();
        this.connector = connector;
        const client = grpc.client(room_rpc.RoomSignal.Signal, connector.grpcClientRpcOptions()) as grpc.Client<room.Request, room.Reply>;

        client.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) =>
            connector.onEnd(service, status, statusMessage, trailers));
        client.onHeaders((headers: grpc.Metadata) => connector.onHeaders(service, headers));

        client.onMessage((reply: room.Reply) => {
            switch (reply.getPayloadCase()) {
                case room.Reply.PayloadCase.JOIN:
                    this.emit('join-reply', {
                        success: reply.getJoin()?.getSuccess() || false,
                        error: reply.getJoin()?.getError() || { errType: ErrorType.NONE, reason: '' },
                        role: reply.getJoin()?.getRole() || Role.HOST,
                        room: reply.getJoin()? {
                            sid: reply.getJoin()?.getRoom()?.getSid() || '',
                            name: reply.getJoin()?.getRoom()?.getName() || '',
                            lock: reply.getJoin()?.getRoom()?.getLock() || false,
                            password: reply.getJoin()?.getRoom()?.getPassword() || '',
                            description: reply.getJoin()?.getRoom()?.getDescription() || '',
                            maxpeers: reply.getJoin()?.getRoom()?.getMaxpeers() || 0,
                        } : undefined,
                    });
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
                    const msg = reply.getMessage();
                    this.emit('message', {
                        from: msg?.getFrom() || "",
                        to: msg?.getTo() || "",
                        type: msg?.getType() || "",
                        data: msg?.getPayload() || {},
                    });
                    break;
                case room.Reply.PayloadCase.ROOM:
                    const info = reply.getRoom() || undefined;
                    this.emit('room-info', {
                        sid: info?.getSid() || "",
                        name: info?.getName() || "",
                        lock: info?.getLock() || false,
                        password: info?.getPassword() || "",
                        description: info?.getDescription() || "",
                        maxpeers: info?.getMaxpeers() || 0,
                    });
                    break;
                case room.Reply.PayloadCase.DISCONNECT:
                    const dis = reply.getDisconnect() || {};
                    this.emit('disconnect', dis);
                    break;
            }
        });

        this._client = client;
        this._client.start(connector.metadata);
    }

    /**
     * join a session/room
     * @date 2021-11-03
     * @param {any} peer:Peer
     * @param {any} password:string|undefined
     * @returns {any}
     */
    async join(peer: Peer, password: string | undefined): Promise<JoinResult> {
        const request = new room.Request();
        const join = new room.JoinRequest();
        const p = new room.Peer();

        p.setUid(peer.uid);
        p.setSid(peer.sid);
        p.setDisplayname(peer.displayname);
        p.setExtrainfo(peer.extrainfo);
        p.setDestination(peer.destination);
        p.setRole(peer.role);
        p.setProtocol(peer.protocol);
        p.setAvatar(peer.avatar);
        p.setDirection(peer.direction);
        p.setVendor(peer.vendor);
        join.setPeer(p);
        if (password) {
            join.setPassword(password);
        }
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

    /**
     * leave a session/room
     * @date 2021-11-03
     * @param {any} sid:string
     * @param {any} uid:string
     * @returns
     */
    async leave(sid: string, uid: string) {
        const request = new room.Request();
        const leave = new room.LeaveRequest();
        leave.setSid(sid);
        leave.setUid(uid);
        request.setLeave(leave);

        this._client.send(request);

        return new Promise<string>((resolve, reject) => {
            const handler = (reason: string) => {
                resolve(reason);
                this.removeListener('leave-reply', handler);
            };
            this.addListener('leave-reply', handler);
        });
    }

    mapToObj(map: Map<string, any>){
        const obj: {[key: string]: any} = {};
        map.forEach((value: any, key: string) => {
            obj[key] = value;
        });
        return obj;
    }
      
    /**
     * send a message to a session/room
     * @date 2021-11-03
     * @param {any} sid:string
     * @param {any} from:string
     * @param {any} to:string
     * @param {any} mineType:string
     * @param {any} data:Map<string
     * @param {any} any>
     * @returns
     */
    async sendMessage(sid: string, from: string, to: string, mineType: string, data: Map<string, any>) {
        const request = new room.Request();
        const sendMessage = new room.SendMessageRequest();
        const message = new room.Message();
        message.setFrom(from);
        message.setTo(to);
        const obj = this.mapToObj(data);
        const buffer = Uint8Array.from(JSON.stringify(obj), (c) => c.charCodeAt(0));
        message.setType(mineType);
        message.setPayload(buffer);
        sendMessage.setSid(sid);
        sendMessage.setMessage(message);
        request.setSendmessage(sendMessage);
        this._client.send(request);
    }

    /**
     * close client
     * @date 2021-11-03
     * @returns
     */
    close() {
        this._client.finishSend();
    }
}
