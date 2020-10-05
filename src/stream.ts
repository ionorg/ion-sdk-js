import PeerConnection from './peerconnection';

interface VideoResolutions {
  [name: string]: { width: { ideal: number }; height: { ideal: number } };
}

export const VideoResolutions: VideoResolutions = {
  qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
  vga: { width: { ideal: 640 }, height: { ideal: 360 } },
  shd: { width: { ideal: 960 }, height: { ideal: 540 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
  fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } },
  qhd: { width: { ideal: 2560 }, height: { ideal: 1440 } },
};

export interface StreamOptions extends MediaStreamConstraints {
  resolution: string;
  codec: string;
}

export class LocalStream extends MediaStream {
  pc?: RTCPeerConnection;

  static async getUserMedia(
    options: StreamOptions = {
      codec: 'VP8',
      resolution: 'hd',
      audio: false,
      video: false,
    },
  ) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: options.audio,
      video:
        options.video instanceof Object
          ? {
              ...VideoResolutions[options.resolution],
              ...options.video,
            }
          : options.video
          ? VideoResolutions[options.resolution]
          : false,
    });

    return new LocalStream(stream, options);
  }

  static async getDisplayMedia(
    options: StreamOptions = {
      codec: 'VP8',
      resolution: 'hd',
      audio: false,
      video: true,
    },
  ) {
    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    return new LocalStream(stream, options);
  }

  options: StreamOptions;
  constructor(stream: MediaStream, options: StreamOptions) {
    super(stream);
    this.options = options;
    Object.setPrototypeOf(this, LocalStream.prototype);
  }

  private getAudioConstraints() {
    return this.options.audio;
  }

  private getVideoConstraints() {
    return this.options.video instanceof Object
      ? { ...VideoResolutions[this.options.resolution], ...(this.options.video as object) }
      : { video: this.options.video };
  }

  private async getTrack(kind: 'audio' | 'video') {
    const stream = await navigator.mediaDevices.getUserMedia({
      [kind]: kind === 'video' ? this.getVideoConstraints() : this.getAudioConstraints(),
    });
    return stream.getTracks()[0];
  }

  publish(pc: RTCPeerConnection) {
    this.pc = pc;
  }

  async switchDevice(kind: 'audio' | 'video', deviceId: string) {
    this.options = {
      ...this.options,
      [kind]:
        this.options[kind] instanceof Object
          ? {
              ...(this.options[kind] as object),
              deviceId,
            }
          : { deviceId },
    };
    const track = await this.getTrack(kind);

    let prev: MediaStreamTrack;
    if (kind === 'audio') {
      prev = this.getAudioTracks()[0];
    } else if (kind === 'video') {
      prev = this.getVideoTracks()[0];
    }
    this.addTrack(track);
    this.removeTrack(prev!);
    prev!.stop();

    // If published, replace published track with track from new device
    if (this.pc) {
      this.pc.getSenders().forEach(async (sender: RTCRtpSender) => {
        if (sender?.track?.kind === track.kind) {
          sender.track?.stop();
          sender.replaceTrack(track);
        }
      });
    }
  }

  mute(kind: 'audio' | 'video') {
    let track = this.getAudioTracks()[0];
    if (kind === 'video') {
      track = this.getVideoTracks()[0];
    }

    this.removeTrack(track);

    // If published, remove the track from the peer connection
    if (this.pc) {
      this.pc.getSenders().forEach(async (sender: RTCRtpSender) => {
        if (sender?.track === track) {
          this.pc!.removeTrack(sender);
        }
      });
    }
  }

  async unmute(kind: 'audio' | 'video') {
    const track = await this.getTrack(kind);
    this.addTrack(track);
    this.pc?.addTrack(track);
  }
}

type Layers = 'none' | 'low' | 'medium' | 'high';

export class RemoteStream extends MediaStream {
  private api: RTCDataChannel;
  private audio: Boolean;
  private video: Layers;

  constructor(stream: MediaStream, api: RTCDataChannel) {
    super(stream);
    Object.setPrototypeOf(this, RemoteStream.prototype);
    this.api = api;
    this.audio = true;
    this.video = 'high';
  }

  private select() {
    this.api.send(
      JSON.stringify({
        streamId: this.id,
        video: this.video,
        audio: this.audio,
      }),
    );
  }

  preferLayer(layer: Layers) {
    this.video = layer;
    this.select();
  }

  mute(kind: 'audio' | 'video') {
    if (kind === 'audio') {
      this.audio = false;
    } else if (kind === 'video') {
      this.video = 'none';
    }
    this.select();
  }

  unmute(kind: 'audio' | 'video') {
    if (kind === 'audio') {
      this.audio = true;
    } else if (kind === 'video') {
      this.video = 'high';
    }
    this.select();
  }
}
