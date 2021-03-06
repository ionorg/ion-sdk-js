// package: ion
// file: ion.proto

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

export class Track extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getKind(): string;
  setKind(value: string): void;

  getRid(): string;
  setRid(value: string): void;

  getSsrc(): number;
  setSsrc(value: number): void;

  getCodec(): string;
  setCodec(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Track.AsObject;
  static toObject(includeInstance: boolean, msg: Track): Track.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Track, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Track;
  static deserializeBinaryFromReader(message: Track, reader: jspb.BinaryReader): Track;
}

export namespace Track {
  export type AsObject = {
    id: string,
    kind: string,
    rid: string,
    ssrc: number,
    codec: string,
  }
}

export class Stream extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  clearTracksList(): void;
  getTracksList(): Array<Track>;
  setTracksList(value: Array<Track>): void;
  addTracks(value?: Track, index?: number): Track;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Stream.AsObject;
  static toObject(includeInstance: boolean, msg: Stream): Stream.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Stream, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Stream;
  static deserializeBinaryFromReader(message: Stream, reader: jspb.BinaryReader): Stream;
}

export namespace Stream {
  export type AsObject = {
    id: string,
    tracksList: Array<Track.AsObject>,
  }
}

export class Peer extends jspb.Message {
  getUid(): string;
  setUid(value: string): void;

  clearStreamsList(): void;
  getStreamsList(): Array<Stream>;
  setStreamsList(value: Array<Stream>): void;
  addStreams(value?: Stream, index?: number): Stream;

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
    uid: string,
    streamsList: Array<Stream.AsObject>,
  }
}

export class Session extends jspb.Message {
  hasNode(): boolean;
  clearNode(): void;
  getNode(): Node | undefined;
  setNode(value?: Node): void;

  getSid(): string;
  setSid(value: string): void;

  clearPeersList(): void;
  getPeersList(): Array<Peer>;
  setPeersList(value: Array<Peer>): void;
  addPeers(value?: Peer, index?: number): Peer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Session.AsObject;
  static toObject(includeInstance: boolean, msg: Session): Session.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Session, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Session;
  static deserializeBinaryFromReader(message: Session, reader: jspb.BinaryReader): Session;
}

export namespace Session {
  export type AsObject = {
    node?: Node.AsObject,
    sid: string,
    peersList: Array<Peer.AsObject>,
  }
}

export class SessionReport extends jspb.Message {
  getState(): SessionReport.StateMap[keyof SessionReport.StateMap];
  setState(value: SessionReport.StateMap[keyof SessionReport.StateMap]): void;

  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionReport.AsObject;
  static toObject(includeInstance: boolean, msg: SessionReport): SessionReport.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SessionReport, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionReport;
  static deserializeBinaryFromReader(message: SessionReport, reader: jspb.BinaryReader): SessionReport;
}

export namespace SessionReport {
  export type AsObject = {
    state: SessionReport.StateMap[keyof SessionReport.StateMap],
    session?: Session.AsObject,
  }

  export interface StateMap {
    NEW: 0;
    UPDATE: 1;
    DELETE: 2;
  }

  export const State: StateMap;
}

export class PeerEvent extends jspb.Message {
  getState(): PeerEvent.StateMap[keyof PeerEvent.StateMap];
  setState(value: PeerEvent.StateMap[keyof PeerEvent.StateMap]): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): Peer | undefined;
  setPeer(value?: Peer): void;

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
    state: PeerEvent.StateMap[keyof PeerEvent.StateMap],
    peer?: Peer.AsObject,
  }

  export interface StateMap {
    JOIN: 0;
    LEAVE: 1;
  }

  export const State: StateMap;
}

export class StreamEvent extends jspb.Message {
  getUid(): string;
  setUid(value: string): void;

  getState(): StreamEvent.StateMap[keyof StreamEvent.StateMap];
  setState(value: StreamEvent.StateMap[keyof StreamEvent.StateMap]): void;

  clearStreamsList(): void;
  getStreamsList(): Array<Stream>;
  setStreamsList(value: Array<Stream>): void;
  addStreams(value?: Stream, index?: number): Stream;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamEvent.AsObject;
  static toObject(includeInstance: boolean, msg: StreamEvent): StreamEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamEvent;
  static deserializeBinaryFromReader(message: StreamEvent, reader: jspb.BinaryReader): StreamEvent;
}

export namespace StreamEvent {
  export type AsObject = {
    uid: string,
    state: StreamEvent.StateMap[keyof StreamEvent.StateMap],
    streamsList: Array<Stream.AsObject>,
  }

  export interface StateMap {
    ADD: 0;
    UPDATE: 1;
    REMOVE: 2;
  }

  export const State: StateMap;
}

export class Message extends jspb.Message {
  getFrom(): string;
  setFrom(value: string): void;

  getTo(): string;
  setTo(value: string): void;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

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
    data: Uint8Array | string,
  }
}

export class Parameter extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Parameter.AsObject;
  static toObject(includeInstance: boolean, msg: Parameter): Parameter.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Parameter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Parameter;
  static deserializeBinaryFromReader(message: Parameter, reader: jspb.BinaryReader): Parameter;
}

export namespace Parameter {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class Node extends jspb.Message {
  getDc(): string;
  setDc(value: string): void;

  getNid(): string;
  setNid(value: string): void;

  getService(): string;
  setService(value: string): void;

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
  }
}

