import { Signal } from './signal';
import { LocalStream, makeRemote, RemoteStream } from './stream';

export default class Client {
  private api: RTCDataChannel;
  pc: RTCPeerConnection;
  private signal: Signal;
  private candidates: RTCIceCandidateInit[];
  private makingOffer: boolean;
  private localStreams: {
    stream: MediaStream;
    transceivers: { [kind in 'video' | 'audio']: RTCRtpTransceiver };
  }[];

  ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

  constructor(
    sid: string,
    signal: Signal,
    config: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
    },
  ) {
    const initialStreams = 2;
    this.candidates = [];
    this.makingOffer = false;
    this.signal = signal;
    this.pc = new RTCPeerConnection(config);
    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        signal.trickle(candidate);
      }
    };
    this.api = this.pc.createDataChannel('ion-sfu');
    this.localStreams = [];
    for (let i = 0; i < initialStreams; i++) {
      const stream = new MediaStream();
      this.localStreams.push({
        stream,
        transceivers: {
          audio: this.pc.addTransceiver('audio', { direction: 'sendonly', streams: [stream] }),
          video: this.pc.addTransceiver('video', { direction: 'sendonly', streams: [stream] }),
        },
      });
    }

    this.pc.ontrack = (ev: RTCTrackEvent) => {
      const stream = ev.streams[0];
      const remote = makeRemote(stream, this.api);

      if (this.ontrack) {
        this.ontrack(ev.track, remote);
      }
    };

    signal.onnegotiate = this.negotiate.bind(this);
    signal.ontrickle = this.trickle.bind(this);
    signal.onready = () => this.join(sid);
  }

  getStats(selector?: MediaStreamTrack) {
    return this.pc.getStats(selector);
  }

  publish(stream: LocalStream) {
    const st = this.localStreams.find((s) => s.stream.getTracks().length === 0);
    if (st) stream.publish(this.pc, st.transceivers, st.stream);
  }

  close() {
    this.signal.close();
  }

  private async join(sid: string) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    const answer = await this.signal.join(sid, offer);

    await this.pc.setRemoteDescription(answer);
    this.candidates.forEach((c) => this.pc.addIceCandidate(c));
    this.pc.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
  }

  private trickle(candidate: RTCIceCandidateInit) {
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(candidate);
    } else {
      this.candidates.push(candidate);
    }
  }

  private async negotiate(description: RTCSessionDescriptionInit) {
    try {
      if (description.type === 'offer' && (this.makingOffer || this.pc.signalingState !== 'stable')) {
        await Promise.all([
          this.pc.setLocalDescription({ type: 'rollback' }),
          this.pc.setRemoteDescription(description), // SRD rolls back as needed
        ]);
      } else {
        await this.pc.setRemoteDescription(description);
      }
      if (description.type === 'offer') {
        await this.pc.setLocalDescription(await this.pc.createAnswer());
        this.signal.answer(this.pc.localDescription!);
      }
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }

  private async onNegotiationNeeded() {
    try {
      this.makingOffer = true;
      const offer = await this.pc.createOffer();
      if (this.pc.signalingState !== 'stable') return;
      await this.pc.setLocalDescription(offer);
      const answer = await this.signal.offer(this.pc.localDescription!);
      await this.pc.setRemoteDescription(answer);
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    } finally {
      this.makingOffer = false;
    }
  }
}
