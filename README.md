# ion-sdk-js

Frontend sdk for the Ion backend.

## Installation

`npm install ion-sdk-js`

## Usage

```ts
import { Client, LocalStream, RemoteStream } from 'ion-sdk-js';
const signal = new IonSFUJSONRPCSignal("wss://endpoint/ws");
const client = new Client("test session", signal);

// Setup handlers
client.ontrack = (track: MediaStreamTrack, stream: RemoteStream) => {
    ...
});

// Get a local stream
const local = await LocalStream.getUserMedia({
    audio: true,
    video: true
});

// Publish local stream
client.publish(local);

// Close client connection
client.close();

// To add your custom stream
import { LocalStream } from 'ion-sdk-js';
(...)
var streamOptions = {
    codec: 'VP8',
    resolution: 'hd'
}
var myLocalStream = new LocalStream (yourStreamHere, streamOptions)

```
