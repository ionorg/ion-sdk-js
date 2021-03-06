// package: biz
// file: biz.proto

import * as jspb from "google-protobuf";
import * as ion_pb from "./ion_pb";

export class Join extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getUid(): string;
  setUid(value: string): void;

  getInfo(): Uint8Array | string;
  getInfo_asU8(): Uint8Array;
  getInfo_asB64(): string;
  setInfo(value: Uint8Array | string): void;

  getToken(): string;
  setToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Join.AsObject;
  static toObject(includeInstance: boolean, msg: Join): Join.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Join, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Join;
  static deserializeBinaryFromReader(message: Join, reader: jspb.BinaryReader): Join;
}

export namespace Join {
  export type AsObject = {
    sid: string,
    uid: string,
    info: Uint8Array | string,
    token: string,
  }
}

export class JoinResult extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  getReason(): string;
  setReason(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinResult.AsObject;
  static toObject(includeInstance: boolean, msg: JoinResult): JoinResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JoinResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinResult;
  static deserializeBinaryFromReader(message: JoinResult, reader: jspb.BinaryReader): JoinResult;
}

export namespace JoinResult {
  export type AsObject = {
    success: boolean,
    reason: string,
  }
}

export class Leave extends jspb.Message {
  getUid(): string;
  setUid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Leave.AsObject;
  static toObject(includeInstance: boolean, msg: Leave): Leave.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Leave, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Leave;
  static deserializeBinaryFromReader(message: Leave, reader: jspb.BinaryReader): Leave;
}

export namespace Leave {
  export type AsObject = {
    uid: string,
  }
}

export class JoinRequest extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): Join | undefined;
  setJoin(value?: Join): void;

  hasLeave(): boolean;
  clearLeave(): void;
  getLeave(): Leave | undefined;
  setLeave(value?: Leave): void;

  hasMsg(): boolean;
  clearMsg(): void;
  getMsg(): ion_pb.Message | undefined;
  setMsg(value?: ion_pb.Message): void;

  getPayloadCase(): JoinRequest.PayloadCase;
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
    join?: Join.AsObject,
    leave?: Leave.AsObject,
    msg?: ion_pb.Message.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    LEAVE = 2,
    MSG = 4,
  }
}

export class JoinReply extends jspb.Message {
  hasResult(): boolean;
  clearResult(): void;
  getResult(): JoinResult | undefined;
  setResult(value?: JoinResult): void;

  hasPeerevent(): boolean;
  clearPeerevent(): void;
  getPeerevent(): ion_pb.PeerEvent | undefined;
  setPeerevent(value?: ion_pb.PeerEvent): void;

  hasStreamevent(): boolean;
  clearStreamevent(): void;
  getStreamevent(): ion_pb.StreamEvent | undefined;
  setStreamevent(value?: ion_pb.StreamEvent): void;

  hasMsg(): boolean;
  clearMsg(): void;
  getMsg(): ion_pb.Message | undefined;
  setMsg(value?: ion_pb.Message): void;

  getPayloadCase(): JoinReply.PayloadCase;
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
    result?: JoinResult.AsObject,
    peerevent?: ion_pb.PeerEvent.AsObject,
    streamevent?: ion_pb.StreamEvent.AsObject,
    msg?: ion_pb.Message.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    RESULT = 1,
    PEEREVENT = 2,
    STREAMEVENT = 3,
    MSG = 4,
  }
}

