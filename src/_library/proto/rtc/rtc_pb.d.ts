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
  }
}

export class JoinReply extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

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
    REMOVE: 1;
  }

  export const State: StateMap;
}

export class Subscription extends jspb.Message {
  clearTrackidsList(): void;
  getTrackidsList(): Array<string>;
  setTrackidsList(value: Array<string>): void;
  addTrackids(value: string, index?: number): string;

  getSubscribe(): boolean;
  setSubscribe(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Subscription.AsObject;
  static toObject(includeInstance: boolean, msg: Subscription): Subscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Subscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Subscription;
  static deserializeBinaryFromReader(message: Subscription, reader: jspb.BinaryReader): Subscription;
}

export namespace Subscription {
  export type AsObject = {
    trackidsList: Array<string>,
    subscribe: boolean,
  }
}

export class MuteTrack extends jspb.Message {
  clearTrackidsList(): void;
  getTrackidsList(): Array<string>;
  setTrackidsList(value: Array<string>): void;
  addTrackids(value: string, index?: number): string;

  getMuted(): boolean;
  setMuted(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MuteTrack.AsObject;
  static toObject(includeInstance: boolean, msg: MuteTrack): MuteTrack.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MuteTrack, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MuteTrack;
  static deserializeBinaryFromReader(message: MuteTrack, reader: jspb.BinaryReader): MuteTrack;
}

export namespace MuteTrack {
  export type AsObject = {
    trackidsList: Array<string>,
    muted: boolean,
  }
}

export class SwitchScalabilityLayer extends jspb.Message {
  getTrackid(): string;
  setTrackid(value: string): void;

  getSpatiallayer(): number;
  setSpatiallayer(value: number): void;

  getTemporallayer(): number;
  setTemporallayer(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SwitchScalabilityLayer.AsObject;
  static toObject(includeInstance: boolean, msg: SwitchScalabilityLayer): SwitchScalabilityLayer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SwitchScalabilityLayer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SwitchScalabilityLayer;
  static deserializeBinaryFromReader(message: SwitchScalabilityLayer, reader: jspb.BinaryReader): SwitchScalabilityLayer;
}

export namespace SwitchScalabilityLayer {
  export type AsObject = {
    trackid: string,
    spatiallayer: number,
    temporallayer: number,
  }
}

export class UpdateSettings extends jspb.Message {
  hasSubcription(): boolean;
  clearSubcription(): void;
  getSubcription(): Subscription | undefined;
  setSubcription(value?: Subscription): void;

  hasSwitchlayer(): boolean;
  clearSwitchlayer(): void;
  getSwitchlayer(): SwitchScalabilityLayer | undefined;
  setSwitchlayer(value?: SwitchScalabilityLayer): void;

  hasMutetrack(): boolean;
  clearMutetrack(): void;
  getMutetrack(): MuteTrack | undefined;
  setMutetrack(value?: MuteTrack): void;

  getCommandCase(): UpdateSettings.CommandCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateSettings.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateSettings): UpdateSettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateSettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateSettings;
  static deserializeBinaryFromReader(message: UpdateSettings, reader: jspb.BinaryReader): UpdateSettings;
}

export namespace UpdateSettings {
  export type AsObject = {
    subcription?: Subscription.AsObject,
    switchlayer?: SwitchScalabilityLayer.AsObject,
    mutetrack?: MuteTrack.AsObject,
  }

  export enum CommandCase {
    COMMAND_NOT_SET = 0,
    SUBCRIPTION = 1,
    SWITCHLAYER = 2,
    MUTETRACK = 3,
  }
}

export class Signalling extends jspb.Message {
  hasJoin(): boolean;
  clearJoin(): void;
  getJoin(): JoinRequest | undefined;
  setJoin(value?: JoinRequest): void;

  hasReply(): boolean;
  clearReply(): void;
  getReply(): JoinReply | undefined;
  setReply(value?: JoinReply): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): SessionDescription | undefined;
  setDescription(value?: SessionDescription): void;

  hasTrickle(): boolean;
  clearTrickle(): void;
  getTrickle(): Trickle | undefined;
  setTrickle(value?: Trickle): void;

  hasUpdatesettings(): boolean;
  clearUpdatesettings(): void;
  getUpdatesettings(): UpdateSettings | undefined;
  setUpdatesettings(value?: UpdateSettings): void;

  hasTrackevent(): boolean;
  clearTrackevent(): void;
  getTrackevent(): TrackEvent | undefined;
  setTrackevent(value?: TrackEvent): void;

  getPayloadCase(): Signalling.PayloadCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Signalling.AsObject;
  static toObject(includeInstance: boolean, msg: Signalling): Signalling.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Signalling, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Signalling;
  static deserializeBinaryFromReader(message: Signalling, reader: jspb.BinaryReader): Signalling;
}

export namespace Signalling {
  export type AsObject = {
    join?: JoinRequest.AsObject,
    reply?: JoinReply.AsObject,
    error?: Error.AsObject,
    description?: SessionDescription.AsObject,
    trickle?: Trickle.AsObject,
    updatesettings?: UpdateSettings.AsObject,
    trackevent?: TrackEvent.AsObject,
  }

  export enum PayloadCase {
    PAYLOAD_NOT_SET = 0,
    JOIN = 1,
    REPLY = 2,
    ERROR = 3,
    DESCRIPTION = 4,
    TRICKLE = 5,
    UPDATESETTINGS = 6,
    TRACKEVENT = 7,
  }
}

export interface TargetMap {
  PUBLISHER: 0;
  SUBSCRIBER: 1;
}

export const Target: TargetMap;

