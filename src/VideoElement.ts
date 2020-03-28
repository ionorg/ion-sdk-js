class VideoElement {
  parentElement: HTMLElement | null | undefined;
  _video: HTMLVideoElement | undefined;

  play(options: {
    id: string;
    stream: MediaStream;
    elementId: string;
    remote?: false;
  }) {
    let video = document.createElement("video");
    video.autoplay = true;
    // video.playsinline = true;
    video.controls = true;
    video.muted = !options.remote;
    video.srcObject = options.stream;
    video.id = `stream${options.id}`;
    let parentElement = document.getElementById(options.elementId);
    parentElement?.appendChild(video);
    this.parentElement = parentElement;
    this._video = video;
  }

  stop() {
    // @ts-ignore
    this._video?.stop();
    this.parentElement?.removeChild(this._video as HTMLVideoElement);
  }
}

export default VideoElement;
