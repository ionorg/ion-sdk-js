# ion-sdk-js

Frontend sdk for the Ion backend.

## Installation

`npm install ion-sdk-js`

## Usage

```ts
import { Client } from 'ion-sdk-js';
const client = new Client('wss://endpoint');

// Setup handlers
client.on('peer-join', (rid: string, uid: string, info: any) => {});
client.on('peer-leave', (rid: string, uid: string) => {});
client.on('transport-open', () => {}));
client.on('transport-closed', () => {});
client.on('stream-add', (rid: string, uid: string, info: any) => {});
client.on('stream-remove', (rid: string, mid: string) => {});
client.on('broadcast', (rid: string, uid: string, info: any) => {});

// Join a room
client.join(rid, {
    name: "name"
});

// Leave room and close connection
client.leave();

// Publish a stream
client.publish(stream, options);

// Unpublish a stream
client.unpublish(mid);

// Subscribe to a stream
client.subscribe(rid, mid);

// Unsubscribe from a stream
client.unsubscribe(rid, mid);

// Broadcast a payload to room
client.unsubscribe(rid, payload);
```
