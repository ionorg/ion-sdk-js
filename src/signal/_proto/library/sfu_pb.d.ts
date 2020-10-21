// package: sfu
// file: sfu.proto

import * as jspb from "google-protobuf";

export class SignalRequest extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinRequest | undefined;
  setJoin(value?: JoinRequest): void;

  hasNegotiate(): boolean;
  clearNegotiate(): void;
  getNegotiate(): SessionDescription | undefined;
  setNegotiate(value?: SessionDescription): void;

  hasTrickle(): boolean;
  clearTrickle(): void;
  getTrickle(): Trickle | undefined;
  setTrickle(value?: Trickle): void;

  getPayloadCase(): SignalRequest.PayloadCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignalRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SignalRequest): SignalRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SignalRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignalRequest;
  static deserializeBinaryFromReader(message: SignalRequest, reader: jspb.BinaryReader): SignalRequest;
}

export namespace SignalRequest {
  export type AsObject = {
    join?: JoinRequest.AsObject,
    negotiate?: SessionDescription.AsObject,
    trickle?: Trickle.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    NEGOTIATE = 2,
    TRICKLE = 3,
  }
}

export class SignalReply extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinReply | undefined;
  setJoin(value?: JoinReply): void;

  hasNegotiate(): boolean;
  clearNegotiate(): void;
  getNegotiate(): SessionDescription | undefined;
  setNegotiate(value?: SessionDescription): void;

  hasTrickle(): boolean;
  clearTrickle(): void;
  getTrickle(): Trickle | undefined;
  setTrickle(value?: Trickle): void;

  getPayloadCase(): SignalReply.PayloadCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignalReply.AsObject;
  static toObject(includeInstance: boolean, msg: SignalReply): SignalReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SignalReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignalReply;
  static deserializeBinaryFromReader(message: SignalReply, reader: jspb.BinaryReader): SignalReply;
}

export namespace SignalReply {
  export type AsObject = {
    join?: JoinReply.AsObject,
    negotiate?: SessionDescription.AsObject,
    trickle?: Trickle.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    NEGOTIATE = 2,
    TRICKLE = 3,
  }
}

export class JoinRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  hasOffer(): boolean;
  clearOffer(): void;
  getOffer(): SessionDescription | undefined;
  setOffer(value?: SessionDescription): void;

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
    sid: string,
    offer?: SessionDescription.AsObject,
  }
}

export class JoinReply extends jspb.Message {
  getPid(): string;
  setPid(value: string): void;

  hasAnswer(): boolean;
  clearAnswer(): void;
  getAnswer(): SessionDescription | undefined;
  setAnswer(value?: SessionDescription): void;

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
    pid: string,
    answer?: SessionDescription.AsObject,
  }
}

export class Trickle extends jspb.Message {
  getInit(): string;
  setInit(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Trickle.AsObject;
  static toObject(includeInstance: boolean, msg: Trickle): Trickle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Trickle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Trickle;
  static deserializeBinaryFromReader(message: Trickle, reader: jspb.BinaryReader): Trickle;
}

export namespace Trickle {
  export type AsObject = {
    init: string,
  }
}

export class SessionDescription extends jspb.Message {
  getType(): string;
  setType(value: string): void;

  getSdp(): Uint8Array | string;
  getSdp_asU8(): Uint8Array;
  getSdp_asB64(): string;
  setSdp(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionDescription.AsObject;
  static toObject(includeInstance: boolean, msg: SessionDescription): SessionDescription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SessionDescription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionDescription;
  static deserializeBinaryFromReader(message: SessionDescription, reader: jspb.BinaryReader): SessionDescription;
}

export namespace SessionDescription {
  export type AsObject = {
    type: string,
    sdp: Uint8Array | string,
  }
}

