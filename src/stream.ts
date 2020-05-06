import * as log from 'loglevel';
import { Peer } from 'protoo-client';
import WebRTCTransport, { Codec } from './transport';

interface VideoResolutions {
  [name: string]: { width: { ideal: number }; height: { ideal: number } };
}

export const VideoResolutions: VideoResolutions = {
  qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
  vga: { width: { ideal: 640 }, height: { ideal: 360 } },
  shd: { width: { ideal: 960 }, height: { ideal: 540 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export interface StreamOptions {
  audioDevice?: string;
  videoDevice?: string;
  resolution: string;
  bandwidth?: number;
  codec: string;
  audio: boolean;
  video: boolean;
  screen: boolean;
}

export class Stream extends MediaStream {
  static dispatch: Peer;
  static setDispatch(dispatch: Peer) {
    Stream.dispatch = dispatch;
  }

  mid?: string;
  rid?: string;
  options?: StreamOptions;
  transport?: WebRTCTransport;
  constructor(stream: MediaStream, options?: StreamOptions) {
    super(stream);
    this.options = options;

    if (!Stream.dispatch) {
      throw new Error('Dispatch not set.');
    }
  }
}

export class LocalStream extends Stream {
  static async getUserMedia(
    options: StreamOptions = {
      codec: 'VP8',
      resolution: 'hd',
      audio: false,
      video: false,
      screen: false,
    },
  ) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: options.audio,
      video: options.video ? VideoResolutions[options.resolution] : options.video,
    });

    return new LocalStream(stream, options);
  }

  async publish(rid: string) {
    const { bandwidth, codec } = this.options!;
    let sendOffer = true;
    this.transport = new WebRTCTransport(codec as Codec);
    this.getTracks().map((track) => this.transport!.addTrack(track, this));
    const offer = await this.transport.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false,
    });
    this.transport.setLocalDescription(offer);
    this.transport.onicecandidate = async () => {
      if (sendOffer) {
        sendOffer = false;
        const jsep = this.transport!.localDescription;
        log.debug(`Sending offer ${jsep}`);
        const result = await Stream.dispatch.request('publish', {
          rid,
          jsep,
          options: {
            codec,
            bandwidth,
          },
        });
        this.mid = result.mid;
        await this.transport!.setRemoteDescription(result?.jsep);
        this.rid = rid;
      }
    };
    this.transport.onnegotiationneeded = async () => {
      log.info('negotiation needed');
    };
  }

  async unpublish() {
    if (!this.rid || !this.mid) {
      throw new Error('Stream is not published.');
    }
    log.debug('unpublish rid => %s, mid => %s', this.rid, this.mid);

    if (this.transport) {
      this.transport.close();
      delete this.transport;
    }

    return await Stream.dispatch
      .request('unpublish', {
        rid: this.rid,
        mid: this.mid,
      })
      .then(() => {
        delete this.rid;
        delete this.mid;
      });
  }
}

export class RemoteStream extends Stream {
  static async getRemoteMedia(rid: string, mid: string) {
    let sendOffer = true;
    log.debug('Creating receiver => %s', mid);
    const transport = new WebRTCTransport();
    transport.addTransceiver('audio');
    transport.addTransceiver('video');
    const desc = await transport.createOffer();
    transport.setLocalDescription(desc);
    transport.onnegotiationneeded = () => {
      log.debug('negotiation needed');
    };
    transport.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
      if (sendOffer) {
        log.debug('Send offer');
        sendOffer = false;
        const jsep = transport.localDescription;
        const result = await this.dispatch.request('subscribe', {
          rid,
          jsep,
          mid,
        });
        log.info(`subscribe success => result(mid: ${result!.mid})`);
        await transport.setRemoteDescription(result?.jsep);
      }
    };
    const stream: MediaStream = await new Promise(async (resolve, reject) => {
      try {
        transport.ontrack = ({ track, streams }: RTCTrackEvent) => {
          log.debug('on track called');
          // once media for a remote track arrives, show it in the remote video element
          track.onunmute = () => {
            resolve(streams[0]);
          };
        };
      } catch (error) {
        log.debug('subscribe request error  => ' + error);
        reject(error);
      }
    });

    const remote = new RemoteStream(stream);
    remote.transport = transport;
    remote.mid = mid;
    remote.rid = rid;
    return remote;
  }

  async unsubscribe() {
    if (!this.transport) {
      throw new Error('Stream is not subscribed.');
    }
    log.debug('unsubscribe mid => %s', this.mid);

    if (this.transport) {
      this.transport.close();
      delete this.transport;
    }
    return await RemoteStream.dispatch.request('unsubscribe', { mid: this.mid });
  }
}
