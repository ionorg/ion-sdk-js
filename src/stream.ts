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

export type Layer = 'low' | 'medium' | 'high';

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

export class LocalStream extends MediaStream {
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
  api?: RTCDataChannel;
  encodingParams?: RTCRtpEncodingParameters[];

  constructor(stream: MediaStream, constraints: Constraints) {
    super(stream);
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
      tracks = this.getVideoTracks();
      return tracks.length > 0 ? this.getVideoTracks()[0] : undefined;
    }

    tracks = this.getAudioTracks();
    return tracks.length > 0 ? this.getAudioTracks()[0] : undefined;
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
      const init: RTCRtpTransceiverInit = {
        streams: [this],
        direction: 'sendonly',
      };
      if (track.kind === 'video') {
        if (this.encodingParams) {
          init.sendEncodings = this.encodingParams;
        } else if (this.constraints.simulcast) {
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
          init.sendEncodings = encodings;
        } else {
          init.sendEncodings = [VideoConstraints[this.constraints.resolution].encodings];
        }
      }
      const transceiver = this.pc.addTransceiver(track, init);
      this.setPreferredCodec(transceiver, track.kind);
    }
  }

  private setPreferredCodec(transceiver: RTCRtpTransceiver, kind: string) {
    if ('setCodecPreferences' in transceiver) {
      const cap = RTCRtpSender.getCapabilities(kind);
      if (!cap) return;
      let selCodec: RTCRtpCodecCapability | undefined;
      // 42e01f for safari/chrome/firefox cross-browser compatibility
      if (kind === 'video' && this.constraints.codec && this.constraints.codec.toLowerCase() === 'h264') {
        this.constraints.preferredCodecProfile = '42e01f'
      }
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
    this.addTrack(next);

    // If published, replace published track with track from new device
    if (prev) {
      this.removeTrack(prev);
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
      this.addTrack(next);

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

  publish(transport: Transport, encodingParams?: RTCRtpEncodingParameters[]) {
    this.pc = transport.pc;
    this.api = transport.api;
    this.encodingParams = encodingParams;
    this.getTracks().forEach(this.publishTrack.bind(this));
  }

  unpublish() {
    if (this.pc) {
      const tracks = this.getTracks();
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

  async enableLayers(layers: Layer[]) {
    const call = {
      streamId: this.id,
      layers,
    };
    const callStr = JSON.stringify(call);

    if (this.api) {
      if (this.api.readyState !== 'open') {
        // queue call if we aren't open yet
        this.api.onopen = () => this.api?.send(JSON.stringify(call));
      } else {
        this.api.send(JSON.stringify(call));
      }
    }
    const layerValues = ['high', 'medium', 'low'] as const;
    await Promise.all(
      layerValues.map(async (layer) => {
        await this.updateMediaEncodingParams({ active: layers.includes(layer) }, layer);
      }),
    );
  }

  async updateMediaEncodingParams(encodingParams: RTCRtpEncodingParameters, layer?: Layer) {
    if (!this.pc) return;
    const tracks = this.getTracks();
    await Promise.all(
      this.pc
        ?.getSenders()
        .filter((sender) => sender.track && tracks.includes(sender.track))
        .map(async (sender) => {
          const params = sender.getParameters();
          if (!params.encodings) {
            params.encodings = [{}];
          }
          let idx = 0;
          if (this.constraints.simulcast && layer) {
            const rid = layer === 'high' ? 'f' : layer === 'medium' ? 'h' : 'q';
            idx = params.encodings.findIndex((encoding) => encoding.rid === rid);
            if (params.encodings.length < idx + 1) return;
          }
          params.encodings[idx] = {
            ...params.encodings[idx],
            ...encodingParams,
          };
          await sender.setParameters(params);
        }),
    );
  }
}

export interface RemoteStream extends MediaStream {
  api: RTCDataChannel;
  audio: boolean;
  video: 'none' | Layer;
  framerate: Layer;
  _videoPreMute: 'none' | Layer;

  preferLayer(layer: 'none' | Layer): void;
  preferFramerate(layer: Layer): void;
  mute(kind: 'audio' | 'video'): void;
  unmute(kind: 'audio' | 'video'): void;
}

export function makeRemote(stream: MediaStream, transport: Transport): RemoteStream {
  const remote = stream as RemoteStream;
  remote.audio = true;
  remote.video = 'none';
  remote.framerate = 'high';
  remote._videoPreMute = 'high';

  const select = () => {
    const call = {
      streamId: remote.id,
      video: remote.video,
      audio: remote.audio,
      framerate: remote.framerate,
    };

    if (transport.api) {
      if (transport.api.readyState !== 'open') {
        // queue call if we aren't open yet
        transport.api.onopen = () => transport.api?.send(JSON.stringify(call));
      } else {
        transport.api.send(JSON.stringify(call));
      }
    }
  };

  remote.preferLayer = (layer: 'none' | Layer) => {
    remote.video = layer;
    select();
  };

  remote.preferFramerate = (layer: Layer) => {
    remote.framerate = layer;
    select();
  };

  remote.mute = (kind: 'audio' | 'video') => {
    if (kind === 'audio') {
      remote.audio = false;
    } else if (kind === 'video') {
      remote._videoPreMute = remote.video;
      remote.video = 'none';
    }
    select();
  };

  remote.unmute = (kind: 'audio' | 'video') => {
    if (kind === 'audio') {
      remote.audio = true;
    } else if (kind === 'video') {
      remote.video = remote._videoPreMute;
    }
    select();
  };

  return remote;
}
