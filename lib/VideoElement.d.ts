declare class VideoElement {
    parentElement: HTMLElement | null | undefined;
    _video: HTMLVideoElement | undefined;
    play(options: {
        id: string;
        stream: MediaStream;
        elementId: string;
        remote?: false;
    }): void;
    stop(): void;
}
export default VideoElement;
