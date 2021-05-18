// package: biz
// file: biz.proto

import * as biz_pb from './biz_pb';
import { grpc } from '@improbable-eng/grpc-web';

type BizSignal = {
  readonly methodName: string;
  readonly service: typeof Biz;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof biz_pb.SignalRequest;
  readonly responseType: typeof biz_pb.SignalReply;
};

export class Biz {
  static readonly serviceName: string;
  static readonly Signal: BizSignal;
}

export type ServiceError = { message: string; code: number; metadata: grpc.Metadata };
export type Status = { details: string; code: number; metadata: grpc.Metadata };

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

export class BizClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  signal(metadata?: grpc.Metadata): BidirectionalStream<biz_pb.SignalRequest, biz_pb.SignalReply>;
}
