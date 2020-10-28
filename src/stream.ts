interface VideoResolution {
  width: { ideal: number };
  height: { ideal: number };
}

interface VideoConstraints {
  [name: string]: {
    resolution: MediaTrackConstraints;
    encodings: RTCRtpEncodingParameters;
  };
}

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

type Layer = 'none' | 'low' | 'medium' | 'high';

export interface Encoding {
  layer: Layer;
  maxBitrate: number;
  maxFramerate: number;
}

export interface Constraints extends MediaStreamConstraints {
  resolution: string;
  codec?: string;
  simulcast?: boolean;
  encodings?: Encoding[];
}

const defaults = {
  codec: 'VP8',
  resolution: 'hd',
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
      codec: 'VP8',
      resolution: 'hd',
      audio: false,
      video: true,
      simulcast: false,
    },
  ) {
    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    return new LocalStream(stream, {
      ...defaults,
      ...constraints,
    });
  }

  constraints: Constraints;
  pc?: RTCPeerConnection;
  stream: MediaStream;

  constructor(stream: MediaStream, constraints: Constraints) {
    this.constraints = constraints;
    this.stream = stream;
  }

  private static computeAudioConstraints(constraints: Constraints): MediaTrackConstraints {
    return !!constraints.audio as MediaTrackConstraints;
  }

  private static computeVideoConstraints(constraints: Constraints): MediaTrackConstraints {
    if (constraints.video instanceof Object) {
      return constraints.video;
    } else if (constraints.resolution) {
      return {
        ...VideoConstraints[constraints.resolution].resolution,
      };
    }
    return !!constraints.video as MediaTrackConstraints;
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
        const encodings: RTCRtpEncodingParameters[] = [
          {
            rid: 'f',
          },
          {
            rid: 'h',
            scaleResolutionDownBy: 2.0,
            maxBitrate: 150000,
          },
          {
            rid: 'q',
            scaleResolutionDownBy: 4.0,
            maxBitrate: 100000,
          },
        ];

        if (this.constraints.encodings) {
          this.constraints.encodings.forEach((encoding) => {
            switch (encoding.layer) {
              case 'high':
                if (encoding.maxBitrate) {
                  encodings[0].maxBitrate = encoding.maxBitrate;
                }

                if (encoding.maxFramerate) {
                  encodings[0].maxFramerate = encoding.maxFramerate;
                }
                break;
              case 'medium':
                if (encoding.maxBitrate) {
                  encodings[1].maxBitrate = encoding.maxBitrate;
                }

                if (encoding.maxFramerate) {
                  encodings[1].maxFramerate = encoding.maxFramerate;
                }
                break;
              case 'low':
                if (encoding.maxBitrate) {
                  encodings[2].maxBitrate = encoding.maxBitrate;
                }

                if (encoding.maxFramerate) {
                  encodings[2].maxFramerate = encoding.maxFramerate;
                }
                break;
            }
          });
        }

        this.pc.addTransceiver(track, {
          streams: [this.stream],
          direction: 'sendrecv',
          sendEncodings: encodings,
        });
      } else {
        this.pc.addTransceiver(track, {
          streams: [this.stream],
          direction: 'sendrecv',
          sendEncodings: [VideoConstraints[this.constraints.resolution].encodings],
        });
      }
    }
  }

  private updateTrack(next: MediaStreamTrack, prev?: MediaStreamTrack) {
    this.stream.addTrack(next);

    // If published, replace published track with track from new device
    if (prev && prev.enabled) {
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

  publish(pc: RTCPeerConnection) {
    this.pc = pc;
    this.stream.getTracks().forEach(this.publishTrack.bind(this));
  }

  unpublish() {
    if (this.pc) {
      this.pc.getSenders().forEach((s: RTCRtpSender) => {
        if (s.track !== undefined) {
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
    if (track) {
      track.stop();
    }
  }

  async unmute(kind: 'audio' | 'video') {
    const prev = this.getTrack(kind);
    const track = await this.getNewTrack(kind);
    this.updateTrack(track, prev);
  }
}

export interface RemoteStream extends MediaStream {
  api: RTCDataChannel;
  audio: boolean;
  video: Layer;
  _videoPreMute: Layer;

  preferLayer(layer: Layer): void;
  mute(kind: 'audio' | 'video'): void;
  unmute(kind: 'audio' | 'video'): void;
}

export function makeRemote(stream: MediaStream, api: RTCDataChannel): RemoteStream {
  const remote = stream as RemoteStream;
  remote.audio = true;
  remote.video = 'none';
  remote._videoPreMute = 'high';

  const select = () => {
    const call = {
      streamId: remote.id,
      video: remote.video,
      audio: remote.audio,
    };
    api.send(JSON.stringify(call));
  };

  remote.preferLayer = (layer: Layer) => {
    remote.video = layer;
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
