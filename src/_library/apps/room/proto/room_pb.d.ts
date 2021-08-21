// package: room
// file: apps/room/proto/room.proto

import * as jspb from "google-protobuf";

export class Error extends jspb.Message {
  getCode(): ErrorTypeMap[keyof ErrorTypeMap];
  setCode(value: ErrorTypeMap[keyof ErrorTypeMap]): void;

  getReason(): string;
  setReason(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code: ErrorTypeMap[keyof ErrorTypeMap],
    reason: string,
  }
}

export class Request extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinRequest | undefined;
  setJoin(value?: JoinRequest): void;

  hasLeave(): boolean;
  clearLeave(): void;
  getLeave(): LeaveRequest | undefined;
  setLeave(value?: LeaveRequest): void;

  hasSendmessage(): boolean;
  clearSendmessage(): void;
  getSendmessage(): SendMessageRequest | undefined;
  setSendmessage(value?: SendMessageRequest): void;

  getPayloadCase(): Request.PayloadCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Request.AsObject;
  static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Request;
  static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
}

export namespace Request {
  export type AsObject = {
    join?: JoinRequest.AsObject,
    leave?: LeaveRequest.AsObject,
    sendmessage?: SendMessageRequest.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    LEAVE = 2,
    SENDMESSAGE = 3,
  }
}

export class Reply extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinReply | undefined;
  setJoin(value?: JoinReply): void;

  hasLeave(): boolean;
  clearLeave(): void;
  getLeave(): LeaveReply | undefined;
  setLeave(value?: LeaveReply): void;

  hasSendmessage(): boolean;
  clearSendmessage(): void;
  getSendmessage(): SendMessageReply | undefined;
  setSendmessage(value?: SendMessageReply): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): PeerEvent | undefined;
  setPeer(value?: PeerEvent): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Message | undefined;
  setMessage(value?: Message): void;

  hasDisconnect(): boolean;
  clearDisconnect(): void;
  getDisconnect(): Disconnect | undefined;
  setDisconnect(value?: Disconnect): void;

  hasRoom(): boolean;
  clearRoom(): void;
  getRoom(): Room | undefined;
  setRoom(value?: Room): void;

  getPayloadCase(): Reply.PayloadCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Reply.AsObject;
  static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Reply;
  static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
}

export namespace Reply {
  export type AsObject = {
    join?: JoinReply.AsObject,
    leave?: LeaveReply.AsObject,
    sendmessage?: SendMessageReply.AsObject,
    peer?: PeerEvent.AsObject,
    message?: Message.AsObject,
    disconnect?: Disconnect.AsObject,
    room?: Room.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    LEAVE = 2,
    SENDMESSAGE = 3,
    PEER = 4,
    MESSAGE = 5,
    DISCONNECT = 6,
    ROOM = 7,
  }
}

export class CreateRoomRequest extends jspb.Message {
  hasRoom(): boolean;
  clearRoom(): void;
  getRoom(): Room | undefined;
  setRoom(value?: Room): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateRoomRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateRoomRequest): CreateRoomRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateRoomRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateRoomRequest;
  static deserializeBinaryFromReader(message: CreateRoomRequest, reader: jspb.BinaryReader): CreateRoomRequest;
}

export namespace CreateRoomRequest {
  export type AsObject = {
    room?: Room.AsObject,
  }
}

export class CreateRoomReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateRoomReply.AsObject;
  static toObject(includeInstance: boolean, msg: CreateRoomReply): CreateRoomReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateRoomReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateRoomReply;
  static deserializeBinaryFromReader(message: CreateRoomReply, reader: jspb.BinaryReader): CreateRoomReply;
}

export namespace CreateRoomReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class DeleteRoomRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteRoomRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteRoomRequest): DeleteRoomRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteRoomRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteRoomRequest;
  static deserializeBinaryFromReader(message: DeleteRoomRequest, reader: jspb.BinaryReader): DeleteRoomRequest;
}

export namespace DeleteRoomRequest {
  export type AsObject = {
    sid: string,
  }
}

export class DeleteRoomReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteRoomReply.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteRoomReply): DeleteRoomReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteRoomReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteRoomReply;
  static deserializeBinaryFromReader(message: DeleteRoomReply, reader: jspb.BinaryReader): DeleteRoomReply;
}

export namespace DeleteRoomReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class JoinRequest extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): Peer | undefined;
  setPeer(value?: Peer): void;

  getPassword(): string;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JoinRequest): JoinRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JoinRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinRequest;
  static deserializeBinaryFromReader(message: JoinRequest, reader: jspb.BinaryReader): JoinRequest;
}

export namespace JoinRequest {
  export type AsObject = {
    peer?: Peer.AsObject,
    password: string,
  }
}

export class Room extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getName(): string;
  setName(value: string): void;

  getLock(): boolean;
  setLock(value: boolean): void;

  getPassword(): string;
  setPassword(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getMaxpeers(): number;
  setMaxpeers(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Room.AsObject;
  static toObject(includeInstance: boolean, msg: Room): Room.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Room, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Room;
  static deserializeBinaryFromReader(message: Room, reader: jspb.BinaryReader): Room;
}

export namespace Room {
  export type AsObject = {
    sid: string,
    name: string,
    lock: boolean,
    password: string,
    description: string,
    maxpeers: number,
  }
}

export class JoinReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  getRole(): RoleMap[keyof RoleMap];
  setRole(value: RoleMap[keyof RoleMap]): void;

  hasRoom(): boolean;
  clearRoom(): void;
  getRoom(): Room | undefined;
  setRoom(value?: Room): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinReply.AsObject;
  static toObject(includeInstance: boolean, msg: JoinReply): JoinReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JoinReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinReply;
  static deserializeBinaryFromReader(message: JoinReply, reader: jspb.BinaryReader): JoinReply;
}

export namespace JoinReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
    role: RoleMap[keyof RoleMap],
    room?: Room.AsObject,
  }
}

export class LeaveRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getUid(): string;
  setUid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaveRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LeaveRequest): LeaveRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeaveRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaveRequest;
  static deserializeBinaryFromReader(message: LeaveRequest, reader: jspb.BinaryReader): LeaveRequest;
}

export namespace LeaveRequest {
  export type AsObject = {
    sid: string,
    uid: string,
  }
}

export class LeaveReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaveReply.AsObject;
  static toObject(includeInstance: boolean, msg: LeaveReply): LeaveReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeaveReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaveReply;
  static deserializeBinaryFromReader(message: LeaveReply, reader: jspb.BinaryReader): LeaveReply;
}

export namespace LeaveReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class Peer extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getUid(): string;
  setUid(value: string): void;

  getDisplayname(): string;
  setDisplayname(value: string): void;

  getExtrainfo(): Uint8Array | string;
  getExtrainfo_asU8(): Uint8Array;
  getExtrainfo_asB64(): string;
  setExtrainfo(value: Uint8Array | string): void;

  getDestination(): string;
  setDestination(value: string): void;

  getRole(): RoleMap[keyof RoleMap];
  setRole(value: RoleMap[keyof RoleMap]): void;

  getProtocol(): ProtocolMap[keyof ProtocolMap];
  setProtocol(value: ProtocolMap[keyof ProtocolMap]): void;

  getAvatar(): string;
  setAvatar(value: string): void;

  getDirection(): Peer.DirectionMap[keyof Peer.DirectionMap];
  setDirection(value: Peer.DirectionMap[keyof Peer.DirectionMap]): void;

  getVendor(): string;
  setVendor(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Peer.AsObject;
  static toObject(includeInstance: boolean, msg: Peer): Peer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Peer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Peer;
  static deserializeBinaryFromReader(message: Peer, reader: jspb.BinaryReader): Peer;
}

export namespace Peer {
  export type AsObject = {
    sid: string,
    uid: string,
    displayname: string,
    extrainfo: Uint8Array | string,
    destination: string,
    role: RoleMap[keyof RoleMap],
    protocol: ProtocolMap[keyof ProtocolMap],
    avatar: string,
    direction: Peer.DirectionMap[keyof Peer.DirectionMap],
    vendor: string,
  }

  export interface DirectionMap {
    INCOMING: 0;
    OUTGOING: 1;
    BILATERAL: 2;
  }

  export const Direction: DirectionMap;
}

export class AddPeerRequest extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): Peer | undefined;
  setPeer(value?: Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddPeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddPeerRequest): AddPeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddPeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddPeerRequest;
  static deserializeBinaryFromReader(message: AddPeerRequest, reader: jspb.BinaryReader): AddPeerRequest;
}

export namespace AddPeerRequest {
  export type AsObject = {
    peer?: Peer.AsObject,
  }
}

export class AddPeerReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddPeerReply.AsObject;
  static toObject(includeInstance: boolean, msg: AddPeerReply): AddPeerReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddPeerReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddPeerReply;
  static deserializeBinaryFromReader(message: AddPeerReply, reader: jspb.BinaryReader): AddPeerReply;
}

export namespace AddPeerReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class GetPeersRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPeersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPeersRequest): GetPeersRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetPeersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPeersRequest;
  static deserializeBinaryFromReader(message: GetPeersRequest, reader: jspb.BinaryReader): GetPeersRequest;
}

export namespace GetPeersRequest {
  export type AsObject = {
    sid: string,
  }
}

export class GetPeersReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  clearPeersList(): void;
  getPeersList(): Array<Peer>;
  setPeersList(value: Array<Peer>): void;
  addPeers(value?: Peer, index?: number): Peer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPeersReply.AsObject;
  static toObject(includeInstance: boolean, msg: GetPeersReply): GetPeersReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetPeersReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPeersReply;
  static deserializeBinaryFromReader(message: GetPeersReply, reader: jspb.BinaryReader): GetPeersReply;
}

export namespace GetPeersReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
    peersList: Array<Peer.AsObject>,
  }
}

export class Message extends jspb.Message {
  getFrom(): string;
  setFrom(value: string): void;

  getTo(): string;
  setTo(value: string): void;

  getType(): string;
  setType(value: string): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    from: string,
    to: string,
    type: string,
    payload: Uint8Array | string,
  }
}

export class SendMessageRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Message | undefined;
  setMessage(value?: Message): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageRequest): SendMessageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageRequest;
  static deserializeBinaryFromReader(message: SendMessageRequest, reader: jspb.BinaryReader): SendMessageRequest;
}

export namespace SendMessageRequest {
  export type AsObject = {
    sid: string,
    message?: Message.AsObject,
  }
}

export class SendMessageReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageReply.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageReply): SendMessageReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendMessageReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageReply;
  static deserializeBinaryFromReader(message: SendMessageReply, reader: jspb.BinaryReader): SendMessageReply;
}

export namespace SendMessageReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class Disconnect extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getReason(): string;
  setReason(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Disconnect.AsObject;
  static toObject(includeInstance: boolean, msg: Disconnect): Disconnect.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Disconnect, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Disconnect;
  static deserializeBinaryFromReader(message: Disconnect, reader: jspb.BinaryReader): Disconnect;
}

export namespace Disconnect {
  export type AsObject = {
    sid: string,
    reason: string,
  }
}

export class PeerEvent extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): Peer | undefined;
  setPeer(value?: Peer): void;

  getState(): PeerStateMap[keyof PeerStateMap];
  setState(value: PeerStateMap[keyof PeerStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PeerEvent.AsObject;
  static toObject(includeInstance: boolean, msg: PeerEvent): PeerEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PeerEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PeerEvent;
  static deserializeBinaryFromReader(message: PeerEvent, reader: jspb.BinaryReader): PeerEvent;
}

export namespace PeerEvent {
  export type AsObject = {
    peer?: Peer.AsObject,
    state: PeerStateMap[keyof PeerStateMap],
  }
}

export class UpdateRoomRequest extends jspb.Message {
  hasRoom(): boolean;
  clearRoom(): void;
  getRoom(): Room | undefined;
  setRoom(value?: Room): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateRoomRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateRoomRequest): UpdateRoomRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateRoomRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateRoomRequest;
  static deserializeBinaryFromReader(message: UpdateRoomRequest, reader: jspb.BinaryReader): UpdateRoomRequest;
}

export namespace UpdateRoomRequest {
  export type AsObject = {
    room?: Room.AsObject,
  }
}

export class UpdateRoomReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateRoomReply.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateRoomReply): UpdateRoomReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateRoomReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateRoomReply;
  static deserializeBinaryFromReader(message: UpdateRoomReply, reader: jspb.BinaryReader): UpdateRoomReply;
}

export namespace UpdateRoomReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class EndRoomRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getReason(): string;
  setReason(value: string): void;

  getDelete(): boolean;
  setDelete(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndRoomRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EndRoomRequest): EndRoomRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EndRoomRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EndRoomRequest;
  static deserializeBinaryFromReader(message: EndRoomRequest, reader: jspb.BinaryReader): EndRoomRequest;
}

export namespace EndRoomRequest {
  export type AsObject = {
    sid: string,
    reason: string,
    pb_delete: boolean,
  }
}

export class EndRoomReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndRoomReply.AsObject;
  static toObject(includeInstance: boolean, msg: EndRoomReply): EndRoomReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EndRoomReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EndRoomReply;
  static deserializeBinaryFromReader(message: EndRoomReply, reader: jspb.BinaryReader): EndRoomReply;
}

export namespace EndRoomReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class GetRoomsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRoomsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetRoomsRequest): GetRoomsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetRoomsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRoomsRequest;
  static deserializeBinaryFromReader(message: GetRoomsRequest, reader: jspb.BinaryReader): GetRoomsRequest;
}

export namespace GetRoomsRequest {
  export type AsObject = {
  }
}

export class GetRoomsReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  clearRoomsList(): void;
  getRoomsList(): Array<Room>;
  setRoomsList(value: Array<Room>): void;
  addRooms(value?: Room, index?: number): Room;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRoomsReply.AsObject;
  static toObject(includeInstance: boolean, msg: GetRoomsReply): GetRoomsReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetRoomsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRoomsReply;
  static deserializeBinaryFromReader(message: GetRoomsReply, reader: jspb.BinaryReader): GetRoomsReply;
}

export namespace GetRoomsReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
    roomsList: Array<Room.AsObject>,
  }
}

export class UpdatePeerRequest extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): Peer | undefined;
  setPeer(value?: Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePeerRequest): UpdatePeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePeerRequest;
  static deserializeBinaryFromReader(message: UpdatePeerRequest, reader: jspb.BinaryReader): UpdatePeerRequest;
}

export namespace UpdatePeerRequest {
  export type AsObject = {
    peer?: Peer.AsObject,
  }
}

export class UpdatePeerReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePeerReply.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePeerReply): UpdatePeerReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePeerReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePeerReply;
  static deserializeBinaryFromReader(message: UpdatePeerReply, reader: jspb.BinaryReader): UpdatePeerReply;
}

export namespace UpdatePeerReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class RemovePeerRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getUid(): string;
  setUid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePeerRequest): RemovePeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemovePeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePeerRequest;
  static deserializeBinaryFromReader(message: RemovePeerRequest, reader: jspb.BinaryReader): RemovePeerRequest;
}

export namespace RemovePeerRequest {
  export type AsObject = {
    sid: string,
    uid: string,
  }
}

export class RemovePeerReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePeerReply.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePeerReply): RemovePeerReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemovePeerReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePeerReply;
  static deserializeBinaryFromReader(message: RemovePeerReply, reader: jspb.BinaryReader): RemovePeerReply;
}

export namespace RemovePeerReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export interface ErrorTypeMap {
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

export const ErrorType: ErrorTypeMap;

export interface RoleMap {
  HOST: 0;
  GUEST: 1;
}

export const Role: RoleMap;

export interface ProtocolMap {
  PROTOCOLUNKNOWN: 0;
  WEBRTC: 1;
  SIP: 2;
  RTMP: 3;
  RTSP: 4;
}

export const Protocol: ProtocolMap;

export interface PeerStateMap {
  JOIN: 0;
  UPDATE: 1;
  LEAVE: 2;
}

export const PeerState: PeerStateMap;

