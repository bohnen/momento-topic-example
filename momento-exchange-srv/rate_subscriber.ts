import {
    TopicItem,
    TopicSubscribe
} from '@gomomento/sdk';
import { subscribe } from './lib/momento_token';

function handle_msg(item: TopicItem){
    let msg = JSON.parse(item.value().toString());
    console.log(msg, "ratency", Date.now() - new Date(msg.timestamp).getTime(), " ms");
}

function handle_error(e: TopicSubscribe.Error){
    console.error(`Error: ${e.message}`);
}

subscribe({
    onItem: handle_msg, 
    onError: handle_error
});
