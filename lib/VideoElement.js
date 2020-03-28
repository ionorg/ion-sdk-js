"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VideoElement = /** @class */ (function () {
    function VideoElement() {
    }
    VideoElement.prototype.play = function (options) {
        var video = document.createElement("video");
        video.autoplay = true;
        // video.playsinline = true;
        video.controls = true;
        video.muted = !options.remote;
        video.srcObject = options.stream;
        video.id = "stream" + options.id;
        var parentElement = document.getElementById(options.elementId);
        parentElement === null || parentElement === void 0 ? void 0 : parentElement.appendChild(video);
        this.parentElement = parentElement;
        this._video = video;
    };
    VideoElement.prototype.stop = function () {
        var _a, _b;
        // @ts-ignore
        (_a = this._video) === null || _a === void 0 ? void 0 : _a.stop();
        (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this._video);
    };
    return VideoElement;
}());
exports.default = VideoElement;
