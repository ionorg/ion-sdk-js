import { Transport } from './client';

interface VideoConstraints {
  [name: string]: {
    resolution: MediaTrackConstraints;
    encodings: RTCRtpEncodingParameters;
  };
}

const resolutions = ['qvga', 'vga', 'shd', 'hd', 'fhd', 'qhd'] as const;

export const VideoConstraints: VideoConstraints = {
  qvga: {
    resolution: {
      width: { ideal: 320 },
      height: { ideal: 180 },
      frameRate: {
        ideal: 15,
        max: 30,
      },
    },
    encodings: {
      maxBitrate: 150_000,
      maxFramerate: 15.0,
    },
  },
  vga: {
    resolution: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      frameRate: {
        ideal: 30,
        max: 60,
      },
    },
    encodings: {
      maxBitrate: 500_000,
      maxFramerate: 30.0,
    },
  },
  shd: {
    resolution: {
      width: { ideal: 960 },
      height: { ideal: 540 },
      frameRate: {
        ideal: 30,
        max: 60,
      },
    },
    encodings: {
      maxBitrate: 1_200_000,
      maxFramerate: 30.0,
    },
  },
  hd: {
    resolution: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: {
        ideal: 30,
        max: 60,
      },
    },
    encodings: {
      maxBitrate: 2_500_000,
      maxFramerate: 30.0,
    },
  },
  fhd: {
    resolution: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: {
        ideal: 30,
        max: 60,
      },
    },
    encodings: {
      maxBitrate: 4_000_000,
      maxFramerate: 30.0,
    },
  },
  qhd: {
    resolution: {
      width: { ideal: 2560 },
      height: { ideal: 1440 },
      frameRate: {
        ideal: 30,
        max: 60,
      },
    },
    encodings: {
      maxBitrate: 8_000_000,
      maxFramerate: 30.0,
    },
  },
};

type Layer = 'low' | 'medium' | 'high';

export interface Encoding {
  layer: Layer;
  maxBitrate: number;
  maxFramerate: number;
}

export interface Constraints extends MediaStreamConstraints {
  resolution: typeof resolutions[number];
  codec: string;
  simulcast?: boolean;
  sendEmptyOnMute?: boolean;
  preferredCodecProfile?: string;
}

const defaults: Constraints = {
  resolution: 'hd',
  codec: 'vp8',
  audio: true,
  video: true,
  simulcast: false,
};

export class LocalStream {
  static async getUserMedia(constraints: Constraints = defaults) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: LocalStream.computeAudioConstraints({
        ...defaults,
        ...constraints,
      }),
      video: LocalStream.computeVideoConstraints({
        ...defaults,
        ...constraints,
      }),
    });
    return new LocalStream(stream, {
      ...defaults,
      ...constraints,
    });
  }

  static async getDisplayMedia(
    constraints: Constraints = {
      codec: 'vp8',
      resolution: 'hd',
      audio: false,
      video: true,
      simulcast: false,
    },
  ) {
    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

    return new LocalStream(stream, {
      ...defaults,
      ...constraints,
    });
  }

  constraints: Constraints;
  pc?: RTCPeerConnection;
  stream: MediaStream;

  constructor(stream: MediaStream, constraints: Constraints) {
    this.stream = stream;
    this.constraints = constraints;
  }

  private static computeAudioConstraints(constraints: Constraints): MediaTrackConstraints {
    return constraints.audio as MediaTrackConstraints;
  }

  private static computeVideoConstraints(constraints: Constraints): MediaTrackConstraints {
    if (constraints.video instanceof Object) {
      return constraints.video;
    } else if (constraints.video && constraints.resolution) {
      return {
        ...VideoConstraints[constraints.resolution].resolution,
      };
    }
    return constraints.video as MediaTrackConstraints;
  }

  private getTrack(kind: 'audio' | 'video') {
    let tracks;
    if (kind === 'video') {
      tracks = this.stream.getVideoTracks();
      return tracks.length > 0 ? this.stream.getVideoTracks()[0] : undefined;
    }

    tracks = this.stream.getAudioTracks();
    return tracks.length > 0 ? this.stream.getAudioTracks()[0] : undefined;
  }

  private async getNewTrack(kind: 'audio' | 'video') {
    const stream = await navigator.mediaDevices.getUserMedia({
      [kind]:
        kind === 'video'
          ? LocalStream.computeVideoConstraints(this.constraints)
          : LocalStream.computeAudioConstraints(this.constraints),
    });
    return stream.getTracks()[0];
  }

  private publishTrack(track: MediaStreamTrack) {
    if (this.pc) {
      if (track.kind === 'video' && this.constraints.simulcast) {
        const idx = resolutions.indexOf(this.constraints.resolution);
        const encodings: RTCRtpEncodingParameters[] = [
          {
            rid: 'f',
            maxBitrate: VideoConstraints[resolutions[idx]].encodings.maxBitrate,
            maxFramerate: VideoConstraints[resolutions[idx]].encodings.maxFramerate,
          },
        ];

        if (idx - 1 >= 0) {
          encodings.push({
            rid: 'h',
            scaleResolutionDownBy: 2.0,
            maxBitrate: VideoConstraints[resolutions[idx - 1]].encodings.maxBitrate,
            maxFramerate: VideoConstraints[resolutions[idx - 1]].encodings.maxFramerate,
          });
        }

        if (idx - 2 >= 0) {
          encodings.push({
            rid: 'q',
            scaleResolutionDownBy: 4.0,
            maxBitrate: VideoConstraints[resolutions[idx - 2]].encodings.maxBitrate,
            maxFramerate: VideoConstraints[resolutions[idx - 2]].encodings.maxFramerate,
          });
        }

        const transceiver = this.pc.addTransceiver(track, {
          streams: [this.stream],
          direction: 'sendonly',
          sendEncodings: encodings,
        });
        this.setPreferredCodec(transceiver, track.kind);
      } else {
        const init: RTCRtpTransceiverInit = {
          streams: [this.stream],
          direction: 'sendonly',
        };
        if (track.kind === 'video') {
          init.sendEncodings = [VideoConstraints[this.constraints.resolution].encodings];
        }
        const transceiver = this.pc.addTransceiver(track, init);
        this.setPreferredCodec(transceiver, track.kind);
      }
    }
  }

  private setPreferredCodec(transceiver: RTCRtpTransceiver, kind: string) {
    if ('setCodecPreferences' in transceiver) {
      const cap = RTCRtpSender.getCapabilities(kind);
      if (!cap) return;

      let selCodec: RTCRtpCodecCapability | undefined;
      if (this.constraints.preferredCodecProfile && kind === 'video') {
        const allCodecProfiles = cap.codecs.filter(
          (c) => c.mimeType.toLowerCase() === `video/${this.constraints.codec.toLowerCase()}`,
        );
        if (!allCodecProfiles) {
          return;
        }
        selCodec = allCodecProfiles.find(
          (c) =>
            c.sdpFmtpLine && c.sdpFmtpLine?.indexOf(`profile-level-id=${this.constraints.preferredCodecProfile}`) >= 0,
        );
        if (!selCodec) {
          // get first one
          selCodec = allCodecProfiles[0];
        }
      } else {
        selCodec = cap.codecs.find(
          (c) =>
            c.mimeType.toLowerCase() === `video/${this.constraints.codec.toLowerCase()}` ||
            c.mimeType.toLowerCase() === `audio/opus`,
        );
      }
      if (selCodec) {
        transceiver.setCodecPreferences([selCodec]);
      }
    }
  }

  private updateTrack(next: MediaStreamTrack, prev?: MediaStreamTrack) {
    this.stream.addTrack(next);

    // If published, replace published track with track from new device
    if (prev) {
      this.stream.removeTrack(prev);
      prev.stop();

      if (this.pc) {
        this.pc.getSenders().forEach(async (sender: RTCRtpSender) => {
          if (sender?.track?.kind === next.kind) {
            sender.track?.stop();
            sender.replaceTrack(next);
          }
        });
      }
    } else {
      this.stream.addTrack(next);

      if (this.pc) {
        this.publishTrack(next);
      }
    }
  }

  private initAudioEmptyTrack(): MediaStreamTrack {
    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.frequency.setValueAtTime(20000, ctx.currentTime);
    const dst = oscillator.connect(ctx.createMediaStreamDestination()) as any;
    oscillator.start();
    return dst.stream.getAudioTracks()[0];
  }

  private initVideoEmptyTrack(width: number, height: number): MediaStreamTrack {
    const canvas = Object.assign(document.createElement('canvas'), { width, height }) as any;
    canvas.getContext('2d')?.fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
  }

  publish(pc: RTCPeerConnection) {
    this.pc = pc;
    this.stream.getTracks().forEach(this.publishTrack.bind(this));
  }

  unpublish() {
    if (this.pc) {
      const tracks = this.stream.getTracks();
      this.pc.getSenders().forEach((s: RTCRtpSender) => {
        if (s.track && tracks.includes(s.track)) {
          this.pc!.removeTrack(s);
        }
      });
    }
  }

  async switchDevice(kind: 'audio' | 'video', deviceId: string) {
    this.constraints = {
      ...this.constraints,
      [kind]:
        this.constraints[kind] instanceof Object
          ? {
              ...(this.constraints[kind] as object),
              deviceId,
            }
          : { deviceId },
    };

    const prev = this.getTrack(kind);
    const next = await this.getNewTrack(kind);

    this.updateTrack(next, prev);
  }

  mute(kind: 'audio' | 'video') {
    const track = this.getTrack(kind);
    if (track && this.constraints.sendEmptyOnMute) {
      const emptyTrack =
        kind === 'audio'
          ? this.initAudioEmptyTrack()
          : this.initVideoEmptyTrack(track?.getSettings().width || 640, track?.getSettings().height || 360);
      emptyTrack.enabled = false;
      this.updateTrack(emptyTrack, track);
      return;
    }
    if (track) {
      track.stop();
    }
  }

  async unmute(kind: 'audio' | 'video') {
    const prev = this.getTrack(kind);
    const track = await this.getNewTrack(kind);
    this.updateTrack(track, prev);
  }

  updateMediaEncodingParams(encodingParams: RTCRtpEncodingParameters) {
    if (!this.pc) return;
    this.stream.getTracks().forEach((track) => {
      const senders = this.pc?.getSenders()?.filter((sender) => track.id === sender.track?.id);
      senders?.forEach((sender) => {
        const params = sender.getParameters();
        if (!params.encodings) {
          params.encodings = [{}];
        }
        params.encodings[0] = {
          ...params.encodings[0],
          ...encodingParams,
        };
        sender.setParameters(params);
      });
    });
  }
}

export class RemoteStream {
  audio: boolean;
  video: 'none' | Layer;
  framerate: Layer;
  _videoPreMute: 'none' | Layer;
  stream: MediaStream;
  transport: Transport;

  constructor(stream: MediaStream, transport: Transport) {
    this.stream = stream;
    this.transport = transport;
    this.audio = true;
    this.video = 'none';
    this.framerate = 'high';
    this._videoPreMute = 'high';
  }

  private select() {
    const call = {
      streamId: this.stream.id,
      video: this.video,
      audio: this.audio,
      framerate: this.framerate,
    };

    if (this.transport.api) {
      if (this.transport.api.readyState !== 'open') {
        // queue call if we aren't open yet
        this.transport.api.onopen = () => this.transport.api?.send(JSON.stringify(call));
      } else {
        this.transport.api.send(JSON.stringify(call));
      }
    }
  };

  preferLayer(layer: 'none' | Layer) {
    this.video = layer;
    this.select();
  }

  preferFramerate(layer: 'none' | Layer) {
    this.video = layer;
    this.select();
  }

  mute(kind: 'audio' | 'video') {
    if (kind === 'audio') {
      this.audio = false;
    } else if (kind === 'video') {
      this._videoPreMute = this.video;
      this.video = 'none';
    }
    this.select();
  }

  unmute(kind: 'audio' | 'video') {
    if (kind === 'audio') {
      this.audio = true;
    } else if (kind === 'video') {
      this.video = this._videoPreMute;
    }
    this.select();
  }
}
