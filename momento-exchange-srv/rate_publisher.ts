import { publish, putCachedPrice } from './lib/momento_token';
import './lib/types';

import { io } from 'socket.io-client';

const publicChannels = ["lightning_ticker_FX_BTC_JPY"];

// init
const socket = io("https://io.lightstream.bitflyer.com", {
    transports: ["websocket"] 
});

socket.on("connect", () => {
    // subscribe to the Public Channels
    for (const ch of publicChannels) {
        socket.emit("subscribe", ch, (err: any) => {
            if (err) {
                console.error(ch, "Subscribe Error:", err);
                return;
            }
            console.log(ch, "Subscribed.");
        });
    }
});

// main loop
for (const ch of publicChannels) {
    socket.on(ch, message => {
        let msg = {
            best_bid: message.best_bid,
            best_ask: message.best_ask,
            orig_timestamp: message.timestamp,
            timestamp: new Date().toISOString()
        };

        publish(msg);
        putCachedPrice(msg);
        console.log(ch, msg);
    });
}
