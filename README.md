# ion-sdk-js

Frontend sdk for the Ion backend.

## Installation

`npm install ion-sdk-js`

## Usage

```ts
import { Client, LocalStream, RemoteStream } from 'ion-sdk-js';
const signal = new IonSFUJSONRPCSignal("wss://ion-sfu:7000");
const client = new Client("test session", signal);

// Setup handlers
client.ontrack = (track: MediaStreamTrack, stream: RemoteStream) => {
    // mute a remote stream
    stream.mute()
    // unmute a remote stream
    stream.unmute()

    if (track.kind === "video") {
         // prefer a layer
         stream.preferLayer("low" | "medium" | "high")
    }
});

// Get a local stream
const local = await client.getUserMedia({
    audio: true,
    video: true,
    simulcast: true, // enable simulcast
});

// Publish stream
local.publish();

// mute local straem
local.mute()

// unmute local stream
local.unmute()

// Close client connection
client.close();
```
