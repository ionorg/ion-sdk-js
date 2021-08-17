// package: rtc
// file: proto/rtc/rtc.proto

import * as proto_rtc_rtc_pb from "../../proto/rtc/rtc_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RTCSignal = {
  readonly methodName: string;
  readonly service: typeof RTC;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof proto_rtc_rtc_pb.Request;
  readonly responseType: typeof proto_rtc_rtc_pb.Reply;
};

export class RTC {
  static readonly serviceName: string;
  static readonly Signal: RTCSignal;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class RTCClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  signal(metadata?: grpc.Metadata): BidirectionalStream<proto_rtc_rtc_pb.Request, proto_rtc_rtc_pb.Reply>;
}

