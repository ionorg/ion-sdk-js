# ion-sdk-js

Frontend sdk for the Ion backend.

## Installation

`npm install ion-sdk-js`

## Usage

```ts
import { Client, LocalStream, RemoteStream } from 'ion-sdk-js';
const client = new Client({ url: 'wss://endpoint' });

// Setup handlers
client.on('peer-join', (uid: string, info: any) => {});
client.on('peer-leave', (uid: string) => {});
client.on('transport-open', () => {}));
client.on('transport-closed', () => {});
client.on('stream-add', (uid: string, info: any) => {});
client.on('stream-remove', (stream: RemoteStream) => {});
client.on('broadcast', (uid: string, info: any) => {});

// Join a room
client.join(rid, {
    name: "name"
});

// Leave current room
client.leave();

// Get a local stream
const local = await LocalStream.getUserMedia({
    audio: true,
    video: true
});

// Publish local stream
client.publish(local);

// Unpublish local stream
local.unpublish();

// Subscribe to a remote stream
const remote = client.subscribe(mid);

// Unsubscribe from a stream
remote.unsubscribe();

// Broadcast a payload to the room
client.broadcast(payload);

// Close client connection
client.close();
```
