declare module 'protoo-client' {
  import http = require('http');

  interface ProtooOptions {
    origin?: string;
    headers?: http.OutgoingHttpHeaders;
    requestOptions?: object;
  }
  export class WebSocketTransport {
    constructor(url: string, options?: ProtooOptions);
  }

  export class Peer {
    constructor(transport: WebSocketTransport);
    close(): void;
    request(method: string, data: {}): Promise<Response>;
    on(event: 'open', cb: () => void): void;
    on(event: 'disconnected', cb: () => void): void;
    on(event: 'close', cb: () => void): void;
    on(event: any, cb: (any: any) => any): void;
  }

  export interface Notification {
    notification: boolean;
    method: string;
    data: any;
  }

  export interface Request {
    request: boolean;
    id: number;
    method: string;
    data: any;
  }

  export interface Response {
    response: boolean;
    id: number;
    ok: boolean;
    data: any;
    errorCode?: number;
    errorReason?: string;
    jsep: any;
    mid: any;
  }
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcofferansweroptions
interface RTCOfferAnswerOptions {
  voiceActivityDetection?: boolean; // default = true
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcofferoptions
interface RTCOfferOptions extends RTCOfferAnswerOptions {
  iceRestart?: boolean; // default = false
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcansweroptions
interface RTCAnswerOptions extends RTCOfferAnswerOptions {}

// https://www.w3.org/TR/webrtc/#idl-def-rtciceserver
interface RTCIceServer {
  //urls: string | string[];
  credentialType?: RTCIceCredentialType; // default = 'password'
}

// https://www.w3.org/TR/webrtc/#idl-def-rtciceparameters
interface RTCIceParameters {
  //usernameFragment: string;
  //password: string;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcicetransport
type IceTransportEventHandler = ((this: RTCIceTransport, ev: Event) => any) | null;
interface RTCIceTransport {
  //readonly role: RTCIceRole;
  //readonly component: RTCIceComponent;
  //readonly state: RTCIceTransportState;
  readonly gatheringState: RTCIceGatheringState;
  getLocalCandidates(): RTCIceCandidate[];
  getRemoteCandidates(): RTCIceCandidate[];
  getSelectedCandidatePair(): RTCIceCandidatePair | null;
  getLocalParameters(): RTCIceParameters | null;
  getRemoteParameters(): RTCIceParameters | null;
  onstatechange: IceTransportEventHandler;
  ongatheringstatechange: IceTransportEventHandler;
  onselectedcandidatepairchange: IceTransportEventHandler;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcdtlstransport
type DtlsTransportEventHandler = ((this: RTCDtlsTransport, ev: Event) => any) | null;
interface RTCDtlsTransport {
  readonly transport: RTCIceTransport;
  //readonly state: RTCDtlsTransportState;
  getRemoteCertificates(): ArrayBuffer[];
  onstatechange: DtlsTransportEventHandler;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpcodeccapability
interface RTCRtpCodecCapability {
  mimeType: string;
  sdpFmtpLine?: string;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpheaderextensioncapability
interface RTCRtpHeaderExtensionCapability {
  uri?: string;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpcapabilities
interface RTCRtpCapabilities {
  //codecs: RTCRtpCodecCapability[];
  //headerExtensions: RTCRtpHeaderExtensionCapability[];
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtprtxparameters
interface RTCRtpRtxParameters {
  //ssrc: number;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpfecparameters
interface RTCRtpFecParameters {
  //ssrc: number;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpencodingparameters
interface RTCRtpEncodingParameters {
  //ssrc: number;
  //rtx: RTCRtpRtxParameters;
  //fec: RTCRtpFecParameters;
  dtx?: RTCDtxStatus;
  //active: boolean;
  //priority: RTCPriorityType;
  maxBitrate?: number;
  maxFramerate?: number;
  rid?: string;
  scaleResolutionDownBy?: number; // default = 1
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpheaderextensionparameters
interface RTCRtpHeaderExtensionParameters {
  //uri: string;
  //id: number;
  encrypted?: boolean;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtcpparameters
interface RTCRtcpParameters {
  //cname: string;
  //reducedSize: boolean;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpcodecparameters
interface RTCRtpCodecParameters {
  //payloadType: number;
  mimeType: string;
  //clockRate: number;
  channels?: number; // default = 1
  sdpFmtpLine?: string;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpparameters
interface RTCRtpParameters {
  transactionId: string;
  encodings: RTCRtpEncodingParameters[];
  //headerExtensions: RTCRtpHeaderExtensionParameters[];
  //rtcp: RTCRtcpParameters;
  //codecs: RTCRtpCodecParameters[];
  degradationPreference?: RTCDegradationPreference; // default = 'balanced'
}

// https://www.w3.org/TR/webrtc/#dom-rtcrtpcontributingsource
interface RTCRtpContributingSource {
  //readonly timestamp: number;
  source: number;
  //readonly audioLevel: number | null;
  readonly voiceActivityFlag?: boolean;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpcapabilities
interface RTCRtcCapabilities {
  codecs: RTCRtpCodecCapability[];
  headerExtensions: RTCRtpHeaderExtensionCapability[];
}

// https://www.w3.org/TR/webrtc/#dom-rtcrtpsender
interface RTCRtpSender {
  //readonly track?: MediaStreamTrack;
  //readonly transport?: RTCDtlsTransport;
  //readonly rtcpTransport?: RTCDtlsTransport;
  setParameters(parameters?: RTCRtpParameters): Promise<void>;
  getParameters(): RTCRtpParameters;
  replaceTrack(withTrack: MediaStreamTrack): Promise<void>;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtpreceiver
interface RTCRtpReceiver {
  //readonly track?: MediaStreamTrack;
  //readonly transport?: RTCDtlsTransport;
  //readonly rtcpTransport?: RTCDtlsTransport;
  getParameters(): RTCRtpParameters;
  getContributingSources(): RTCRtpContributingSource[];
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtptransceiver
interface RTCRtpTransceiver {
  readonly mid: string | null;
  readonly sender: RTCRtpSender;
  readonly receiver: RTCRtpReceiver;
  readonly stopped: boolean;
  direction: RTCRtpTransceiverDirection;
  setDirection(direction: RTCRtpTransceiverDirection): void;
  stop(): void;
  setCodecPreferences(codecs: RTCRtpCodecCapability[]): void;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcrtptransceiverinit
interface RTCRtpTransceiverInit {
  direction?: RTCRtpTransceiverDirection; // default = 'sendrecv'
  streams?: MediaStream[];
  sendEncodings?: RTCRtpEncodingParameters[];
}

// https://www.w3.org/TR/webrtc/#dom-rtccertificate
interface RTCCertificate {
  readonly expires: number;
  getAlgorithm(): string;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcconfiguration
interface RTCConfiguration {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy; // default = 'all'
  bundlePolicy?: RTCBundlePolicy; // default = 'balanced'
  rtcpMuxPolicy?: RTCRtcpMuxPolicy; // default = 'require'
  peerIdentity?: string; // default = null
  certificates?: RTCCertificate[];
  iceCandidatePoolSize?: number; // default = 0
}

// Compatibility for older definitions on DefinitelyTyped.
type RTCPeerConnectionConfig = RTCConfiguration;

// https://www.w3.org/TR/webrtc/#idl-def-rtcsctptransport
interface RTCSctpTransport {
  readonly transport: RTCDtlsTransport;
  readonly maxMessageSize: number;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcdatachannelinit
interface RTCDataChannelInit {
  ordered?: boolean; // default = true
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
  protocol?: string; // default = ''
  negotiated?: boolean; // default = false
  id?: number;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcdatachannel
type DataChannelEventHandler<E extends Event> = ((this: RTCDataChannel, ev: E) => any) | null;
interface RTCDataChannel extends EventTarget {
  readonly label: string;
  readonly ordered: boolean;
  readonly maxPacketLifeTime: number | null;
  readonly maxRetransmits: number | null;
  readonly protocol: string;
  readonly negotiated: boolean;
  readonly id: number | null;
  readonly readyState: RTCDataChannelState;
  readonly bufferedAmount: number;
  bufferedAmountLowThreshold: number;
  binaryType: string;

  close(): void;
  send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;

  onopen: DataChannelEventHandler<Event>;
  onmessage: DataChannelEventHandler<MessageEvent>;
  onbufferedamountlow: DataChannelEventHandler<Event>;
  onerror: DataChannelEventHandler<RTCErrorEvent>;
  onclose: DataChannelEventHandler<Event>;
}

// https://www.w3.org/TR/webrtc/#h-rtctrackevent
interface RTCTrackEvent extends Event {
  readonly receiver: RTCRtpReceiver;
  readonly track: MediaStreamTrack;
  readonly streams: ReadonlyArray<MediaStream>;
  readonly transceiver: RTCRtpTransceiver;
}

// https://www.w3.org/TR/webrtc/#h-rtcpeerconnectioniceevent
interface RTCPeerConnectionIceEvent extends Event {
  readonly url: string | null;
}

// https://www.w3.org/TR/webrtc/#h-rtcpeerconnectioniceerrorevent
interface RTCPeerConnectionIceErrorEvent extends Event {
  readonly hostCandidate: string;
  readonly url: string;
  readonly errorCode: number;
  readonly errorText: string;
}

// https://www.w3.org/TR/webrtc/#h-rtcdatachannelevent
interface RTCDataChannelEvent {
  readonly channel: RTCDataChannel;
}

// https://www.w3.org/TR/webrtc/#idl-def-rtcpeerconnection
type PeerConnectionEventHandler<E extends Event> = ((this: RTCPeerConnection, ev: E) => any) | null;
interface RTCPeerConnection extends EventTarget {
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;

  setLocalDescription(description?: RTCSessionDescriptionInit): Promise<void>;
  readonly localDescription: RTCSessionDescription | null;
  readonly currentLocalDescription: RTCSessionDescription | null;
  readonly pendingLocalDescription: RTCSessionDescription | null;

  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  readonly remoteDescription: RTCSessionDescription | null;
  readonly currentRemoteDescription: RTCSessionDescription | null;
  readonly pendingRemoteDescription: RTCSessionDescription | null;

  addIceCandidate(candidate?: RTCIceCandidateInit | RTCIceCandidate): Promise<void>;

  readonly signalingState: RTCSignalingState;
  readonly connectionState: RTCPeerConnectionState;

  restartIce(): void;
  getConfiguration(): RTCConfiguration;
  setConfiguration(configuration: RTCConfiguration): void;
  close(): void;

  onicecandidateerror: PeerConnectionEventHandler<RTCPeerConnectionIceErrorEvent>;
  onconnectionstatechange: PeerConnectionEventHandler<Event>;

  // Extension: https://www.w3.org/TR/webrtc/#h-rtcpeerconnection-interface-extensions
  getSenders(): RTCRtpSender[];
  getReceivers(): RTCRtpReceiver[];
  getTransceivers(): RTCRtpTransceiver[];
  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
  removeTrack(sender: RTCRtpSender): void;
  addTransceiver(trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver;
  ontrack: PeerConnectionEventHandler<RTCTrackEvent>;

  // Extension: https://www.w3.org/TR/webrtc/#h-rtcpeerconnection-interface-extensions-1
  readonly sctp: RTCSctpTransport | null;
  createDataChannel(label: string | null, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
  ondatachannel: PeerConnectionEventHandler<RTCDataChannelEvent>;

  // Extension: https://www.w3.org/TR/webrtc/#h-rtcpeerconnection-interface-extensions-2
  getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport>;
}
interface RTCPeerConnectionStatic {
  new (configuration?: RTCConfiguration, options?: any): RTCPeerConnection;
  readonly defaultIceServers: RTCIceServer[];

  // Extension: https://www.w3.org/TR/webrtc/#sec.cert-mgmt
  generateCertificate(keygenAlgorithm: string): Promise<RTCCertificate>;
}

interface Window {
  RTCPeerConnection: RTCPeerConnectionStatic;
}

interface ConstrainBooleanParameters {
  exact?: boolean;
  ideal?: boolean;
}

interface NumberRange {
  max?: number;
  min?: number;
}

interface ConstrainNumberRange extends NumberRange {
  exact?: number;
  ideal?: number;
}

interface ConstrainStringParameters {
  exact?: string | string[];
  ideal?: string | string[];
}

interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

declare namespace W3C {
  type LongRange = NumberRange;
  type DoubleRange = NumberRange;
  type ConstrainBoolean = boolean | ConstrainBooleanParameters;
  type ConstrainNumber = number | ConstrainNumberRange;
  type ConstrainLong = ConstrainNumber;
  type ConstrainDouble = ConstrainNumber;
  type ConstrainString = string | string[] | ConstrainStringParameters;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
  advanced?: MediaTrackConstraintSet[];
}

interface MediaTrackConstraintSet {
  width?: W3C.ConstrainLong;
  height?: W3C.ConstrainLong;
  aspectRatio?: W3C.ConstrainDouble;
  frameRate?: W3C.ConstrainDouble;
  facingMode?: W3C.ConstrainString;
  volume?: W3C.ConstrainDouble;
  sampleRate?: W3C.ConstrainLong;
  sampleSize?: W3C.ConstrainLong;
  echoCancellation?: W3C.ConstrainBoolean;
  latency?: W3C.ConstrainDouble;
  deviceId?: W3C.ConstrainString;
  groupId?: W3C.ConstrainString;
}

interface MediaTrackSupportedConstraints {
  width?: boolean;
  height?: boolean;
  aspectRatio?: boolean;
  frameRate?: boolean;
  facingMode?: boolean;
  volume?: boolean;
  sampleRate?: boolean;
  sampleSize?: boolean;
  echoCancellation?: boolean;
  latency?: boolean;
  deviceId?: boolean;
  groupId?: boolean;
}

interface MediaStream extends EventTarget {
  //id: string;
  //active: boolean;

  //onactive: EventListener;
  //oninactive: EventListener;
  //onaddtrack: (event: MediaStreamTrackEvent) => any;
  //onremovetrack: (event: MediaStreamTrackEvent) => any;

  clone(): MediaStream;
  stop(): void;

  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  getTracks(): MediaStreamTrack[];

  getTrackById(trackId: string): MediaStreamTrack;

  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
}

interface MediaStreamTrackEvent extends Event {
  //track: MediaStreamTrack;
}

interface MediaStreamTrack extends EventTarget {
  //id: string;
  //kind: string;
  //label: string;
  enabled: boolean;
  //muted: boolean;
  //remote: boolean;
  //readyState: MediaStreamTrackState;

  //onmute: EventListener;
  //onunmute: EventListener;
  //onended: EventListener;
  //onoverconstrained: EventListener;

  clone(): MediaStreamTrack;

  stop(): void;

  getCapabilities(): MediaTrackCapabilities;
  getConstraints(): MediaTrackConstraints;
  getSettings(): MediaTrackSettings;
  applyConstraints(constraints: MediaTrackConstraints): Promise<void>;
}

interface MediaTrackCapabilities {
  //width: number | W3C.LongRange;
  //height: number | W3C.LongRange;
  //aspectRatio: number | W3C.DoubleRange;
  //frameRate: number | W3C.DoubleRange;
  //facingMode: string;
  //volume: number | W3C.DoubleRange;
  //sampleRate: number | W3C.LongRange;
  //sampleSize: number | W3C.LongRange;
  //echoCancellation: boolean[];
  latency?: W3C.DoubleRange;
  //deviceId: string;
  //groupId: string;
}

interface MediaTrackSettings {
  //width: number;
  //height: number;
  //aspectRatio: number;
  //frameRate: number;
  //facingMode: string;
  //volume: number;
  //sampleRate: number;
  //sampleSize: number;
  //echoCancellation: boolean;
  latency?: number;
  //deviceId: string;
  //groupId: string;
}

interface MediaStreamError {
  //name: string;
  //message: string;
  //constraintName: string;
}

interface NavigatorGetUserMedia {
  (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: MediaStreamError) => void,
  ): void;
}

// to use with adapter.js, see: https://github.com/webrtc/adapter
declare var getUserMedia: NavigatorGetUserMedia;

interface Navigator {
  getUserMedia: NavigatorGetUserMedia;

  webkitGetUserMedia: NavigatorGetUserMedia;

  mozGetUserMedia: NavigatorGetUserMedia;

  msGetUserMedia: NavigatorGetUserMedia;

  readonly mediaDevices: MediaDevices;
}

interface MediaDevices {
  getSupportedConstraints(): MediaTrackSupportedConstraints;

  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  enumerateDevices(): Promise<MediaDeviceInfo[]>;
}

interface MediaDeviceInfo {
  //label: string;
  //deviceId: string;
  //kind: string;
  //groupId: string;
}
