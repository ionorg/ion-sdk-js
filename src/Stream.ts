import { EventEmitter } from "events";
import VideoElement from "./VideoElement";

interface VideoResolutions {
  [name: string]: { width: { ideal: number }; height: { ideal: number } };
}

const VideoResolutions: VideoResolutions = {
  qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
  vga: { width: { ideal: 640 }, height: { ideal: 360 } },
  shd: { width: { ideal: 960 }, height: { ideal: 540 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } }
};

export default class Stream extends EventEmitter {
  _mid: string | null;
  _stream: MediaStream | null;
  _videoElement: VideoElement;

  constructor(mid: string | null = null, stream: MediaStream | null = null) {
    super();
    this._mid = mid;
    this._stream = stream;
    this._videoElement = new VideoElement();
  }

  async init(
    sender = false,
    options = { audio: true, video: true, screen: false, resolution: "hd" }
  ) {
    if (sender) {
      if (options.screen) {
        // @ts-ignore
        this._stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
      } else {
        this._stream = await navigator.mediaDevices.getUserMedia({
          audio: options.audio,
          video:
            options.video === true
              ? VideoResolutions[options.resolution]
              : false
        });
      }
    }
  }

  set mid(id) {
    this._mid = id;
  }

  get mid() {
    return this._mid;
  }

  get stream() {
    return this._stream;
  }

  render(elementId: string) {
    this._videoElement.play({
      id: this._mid as string,
      stream: this._stream as MediaStream,
      elementId
    });
  }

  async stop() {
    this._videoElement.stop();
  }
}
