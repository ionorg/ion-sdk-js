// package: ion
// file: proto/ion/ion.proto

import * as jspb from "google-protobuf";

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class RPC extends jspb.Message {
  getProtocol(): string;
  setProtocol(value: string): void;

  getAddr(): string;
  setAddr(value: string): void;

  getParamsMap(): jspb.Map<string, string>;
  clearParamsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RPC.AsObject;
  static toObject(includeInstance: boolean, msg: RPC): RPC.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RPC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RPC;
  static deserializeBinaryFromReader(message: RPC, reader: jspb.BinaryReader): RPC;
}

export namespace RPC {
  export type AsObject = {
    protocol: string,
    addr: string,
    paramsMap: Array<[string, string]>,
  }
}

export class Node extends jspb.Message {
  getDc(): string;
  setDc(value: string): void;

  getNid(): string;
  setNid(value: string): void;

  getService(): string;
  setService(value: string): void;

  hasRpc(): boolean;
  clearRpc(): void;
  getRpc(): RPC | undefined;
  setRpc(value?: RPC): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    dc: string,
    nid: string,
    service: string,
    rpc?: RPC.AsObject,
  }
}

