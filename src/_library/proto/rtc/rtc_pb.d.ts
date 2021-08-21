// package: rtc
// file: proto/rtc/rtc.proto

import * as jspb from "google-protobuf";

export class JoinRequest extends jspb.Message {
  getSid(): string;
  setSid(value: string): void;

  getUid(): string;
  setUid(value: string): void;

  getConfigMap(): jspb.Map<string, string>;
  clearConfigMap(): void;
  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): SessionDescription | undefined;
  setDescription(value?: SessionDescription): void;

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
    uid: string,
    configMap: Array<[string, string]>,
    description?: SessionDescription.AsObject,
  }
}

export class JoinReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): SessionDescription | undefined;
  setDescription(value?: SessionDescription): void;

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
    description?: SessionDescription.AsObject,
  }
}

export class SessionDescription extends jspb.Message {
  getTarget(): TargetMap[keyof TargetMap];
  setTarget(value: TargetMap[keyof TargetMap]): void;

  getType(): string;
  setType(value: string): void;

  getSdp(): string;
  setSdp(value: string): void;

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
    target: TargetMap[keyof TargetMap],
    type: string,
    sdp: string,
  }
}

export class Trickle extends jspb.Message {
  getTarget(): TargetMap[keyof TargetMap];
  setTarget(value: TargetMap[keyof TargetMap]): void;

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
    target: TargetMap[keyof TargetMap],
    init: string,
  }
}

export class Error extends jspb.Message {
  getCode(): number;
  setCode(value: number): void;

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
    code: number,
    reason: string,
  }
}

export class Simulcast extends jspb.Message {
  getRid(): string;
  setRid(value: string): void;

  getDirection(): string;
  setDirection(value: string): void;

  getParameters(): string;
  setParameters(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Simulcast.AsObject;
  static toObject(includeInstance: boolean, msg: Simulcast): Simulcast.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Simulcast, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Simulcast;
  static deserializeBinaryFromReader(message: Simulcast, reader: jspb.BinaryReader): Simulcast;
}

export namespace Simulcast {
  export type AsObject = {
    rid: string,
    direction: string,
    parameters: string,
  }
}

export class Track extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getType(): MediaTypeMap[keyof MediaTypeMap];
  setType(value: MediaTypeMap[keyof MediaTypeMap]): void;

  getStreamId(): string;
  setStreamId(value: string): void;

  getKind(): string;
  setKind(value: string): void;

  getMuted(): boolean;
  setMuted(value: boolean): void;

  getRid(): string;
  setRid(value: string): void;

  clearSimulcastList(): void;
  getSimulcastList(): Array<Simulcast>;
  setSimulcastList(value: Array<Simulcast>): void;
  addSimulcast(value?: Simulcast, index?: number): Simulcast;

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
    type: MediaTypeMap[keyof MediaTypeMap],
    streamId: string,
    kind: string,
    muted: boolean,
    rid: string,
    simulcastList: Array<Simulcast.AsObject>,
  }
}

export class TrackEvent extends jspb.Message {
  getState(): TrackEvent.StateMap[keyof TrackEvent.StateMap];
  setState(value: TrackEvent.StateMap[keyof TrackEvent.StateMap]): void;

  getUid(): string;
  setUid(value: string): void;

  clearTracksList(): void;
  getTracksList(): Array<Track>;
  setTracksList(value: Array<Track>): void;
  addTracks(value?: Track, index?: number): Track;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackEvent.AsObject;
  static toObject(includeInstance: boolean, msg: TrackEvent): TrackEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TrackEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackEvent;
  static deserializeBinaryFromReader(message: TrackEvent, reader: jspb.BinaryReader): TrackEvent;
}

export namespace TrackEvent {
  export type AsObject = {
    state: TrackEvent.StateMap[keyof TrackEvent.StateMap],
    uid: string,
    tracksList: Array<Track.AsObject>,
  }

  export interface StateMap {
    ADD: 0;
    UPDATE: 1;
    REMOVE: 2;
  }

  export const State: StateMap;
}

export class SubscriptionRequest extends jspb.Message {
  clearTrackidsList(): void;
  getTrackidsList(): Array<string>;
  setTrackidsList(value: Array<string>): void;
  addTrackids(value: string, index?: number): string;

  getSubscribe(): boolean;
  setSubscribe(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionRequest): SubscriptionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionRequest;
  static deserializeBinaryFromReader(message: SubscriptionRequest, reader: jspb.BinaryReader): SubscriptionRequest;
}

export namespace SubscriptionRequest {
  export type AsObject = {
    trackidsList: Array<string>,
    subscribe: boolean,
  }
}

export class SubscriptionReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionReply.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionReply): SubscriptionReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscriptionReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionReply;
  static deserializeBinaryFromReader(message: SubscriptionReply, reader: jspb.BinaryReader): SubscriptionReply;
}

export namespace SubscriptionReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class AddTrackRequest extends jspb.Message {
  clearTracksList(): void;
  getTracksList(): Array<Track>;
  setTracksList(value: Array<Track>): void;
  addTracks(value?: Track, index?: number): Track;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddTrackRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddTrackRequest): AddTrackRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddTrackRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddTrackRequest;
  static deserializeBinaryFromReader(message: AddTrackRequest, reader: jspb.BinaryReader): AddTrackRequest;
}

export namespace AddTrackRequest {
  export type AsObject = {
    tracksList: Array<Track.AsObject>,
  }
}

export class AddTrackReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddTrackReply.AsObject;
  static toObject(includeInstance: boolean, msg: AddTrackReply): AddTrackReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddTrackReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddTrackReply;
  static deserializeBinaryFromReader(message: AddTrackReply, reader: jspb.BinaryReader): AddTrackReply;
}

export namespace AddTrackReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class UpdateTrackRequest extends jspb.Message {
  clearTracksList(): void;
  getTracksList(): Array<UpdateTrackRequest.TrackInfo>;
  setTracksList(value: Array<UpdateTrackRequest.TrackInfo>): void;
  addTracks(value?: UpdateTrackRequest.TrackInfo, index?: number): UpdateTrackRequest.TrackInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTrackRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTrackRequest): UpdateTrackRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTrackRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTrackRequest;
  static deserializeBinaryFromReader(message: UpdateTrackRequest, reader: jspb.BinaryReader): UpdateTrackRequest;
}

export namespace UpdateTrackRequest {
  export type AsObject = {
    tracksList: Array<UpdateTrackRequest.TrackInfo.AsObject>,
  }

  export class TrackInfo extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    getMuted(): boolean;
    setMuted(value: boolean): void;

    getType(): MediaTypeMap[keyof MediaTypeMap];
    setType(value: MediaTypeMap[keyof MediaTypeMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TrackInfo.AsObject;
    static toObject(includeInstance: boolean, msg: TrackInfo): TrackInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TrackInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TrackInfo;
    static deserializeBinaryFromReader(message: TrackInfo, reader: jspb.BinaryReader): TrackInfo;
  }

  export namespace TrackInfo {
    export type AsObject = {
      id: string,
      muted: boolean,
      type: MediaTypeMap[keyof MediaTypeMap],
    }
  }
}

export class UpdateTrackReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTrackReply.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTrackReply): UpdateTrackReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTrackReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTrackReply;
  static deserializeBinaryFromReader(message: UpdateTrackReply, reader: jspb.BinaryReader): UpdateTrackReply;
}

export namespace UpdateTrackReply {
  export type AsObject = {
    success: boolean,
    error?: Error.AsObject,
  }
}

export class Request extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinRequest | undefined;
  setJoin(value?: JoinRequest): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): SessionDescription | undefined;
  setDescription(value?: SessionDescription): void;

  hasTrickle(): boolean;
  clearTrickle(): void;
  getTrickle(): Trickle | undefined;
  setTrickle(value?: Trickle): void;

  hasSubscription(): boolean;
  clearSubscription(): void;
  getSubscription(): SubscriptionRequest | undefined;
  setSubscription(value?: SubscriptionRequest): void;

  hasAddtrack(): boolean;
  clearAddtrack(): void;
  getAddtrack(): AddTrackRequest | undefined;
  setAddtrack(value?: AddTrackRequest): void;

  hasUpdatetrack(): boolean;
  clearUpdatetrack(): void;
  getUpdatetrack(): UpdateTrackRequest | undefined;
  setUpdatetrack(value?: UpdateTrackRequest): void;

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
    description?: SessionDescription.AsObject,
    trickle?: Trickle.AsObject,
    subscription?: SubscriptionRequest.AsObject,
    addtrack?: AddTrackRequest.AsObject,
    updatetrack?: UpdateTrackRequest.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    DESCRIPTION = 2,
    TRICKLE = 3,
    SUBSCRIPTION = 4,
    ADDTRACK = 5,
    UPDATETRACK = 6,
  }
}

export class Reply extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinReply | undefined;
  setJoin(value?: JoinReply): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): SessionDescription | undefined;
  setDescription(value?: SessionDescription): void;

  hasTrickle(): boolean;
  clearTrickle(): void;
  getTrickle(): Trickle | undefined;
  setTrickle(value?: Trickle): void;

  hasTrackevent(): boolean;
  clearTrackevent(): void;
  getTrackevent(): TrackEvent | undefined;
  setTrackevent(value?: TrackEvent): void;

  hasSubscription(): boolean;
  clearSubscription(): void;
  getSubscription(): SubscriptionReply | undefined;
  setSubscription(value?: SubscriptionReply): void;

  hasAddtrack(): boolean;
  clearAddtrack(): void;
  getAddtrack(): AddTrackReply | undefined;
  setAddtrack(value?: AddTrackReply): void;

  hasUpdatetrack(): boolean;
  clearUpdatetrack(): void;
  getUpdatetrack(): UpdateTrackReply | undefined;
  setUpdatetrack(value?: UpdateTrackReply): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

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
    description?: SessionDescription.AsObject,
    trickle?: Trickle.AsObject,
    trackevent?: TrackEvent.AsObject,
    subscription?: SubscriptionReply.AsObject,
    addtrack?: AddTrackReply.AsObject,
    updatetrack?: UpdateTrackReply.AsObject,
    error?: Error.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    DESCRIPTION = 2,
    TRICKLE = 3,
    TRACKEVENT = 4,
    SUBSCRIPTION = 5,
    ADDTRACK = 6,
    UPDATETRACK = 7,
    ERROR = 8,
  }
}

export interface TargetMap {
  PUBLISHER: 0;
  SUBSCRIBER: 1;
}

export const Target: TargetMap;

export interface MediaTypeMap {
  MEDIAUNKNOWN: 0;
  USERMEDIA: 1;
  SCREENCAPTURE: 2;
  CANVAS: 3;
  STREAMING: 4;
  VOIP: 5;
}

export const MediaType: MediaTypeMap;

