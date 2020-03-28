/// <reference types="node" />
import { EventEmitter } from "events";
import VideoElement from "./VideoElement";
export default class Stream extends EventEmitter {
    _mid: string | null;
    _stream: MediaStream | null;
    _videoElement: VideoElement;
    constructor(mid?: string | null, stream?: MediaStream | null);
    init(sender?: boolean, options?: {
        audio: boolean;
        video: boolean;
        screen: boolean;
        resolution: string;
    }): Promise<void>;
    set mid(id: string | null);
    get mid(): string | null;
    get stream(): MediaStream | null;
    render(elementId: string): void;
    stop(): Promise<void>;
}
