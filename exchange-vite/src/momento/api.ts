import {
  Configurations,
  CredentialProvider,
  TopicClient,
  TopicItem,
  TopicSubscribe
} from '@gomomento/sdk-web';
import axios from 'axios';

const authUrl = "http://localhost:3333/auth";
const orderUrl = "http://localhost:3333/order";

const cache = "momento-exchange";
const topic = "rate";

// type definitions

type AuthToken = {
  token: string;
};

export interface Rate {
  best_bid: number;
  best_ask: number;
  orig_timestamp: string;
  timestamp: string;
}

export type Execution = {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  executed_price: number;
  executed_time: string;
  status: 'done' | 'nothing';
}

type Order = {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

// functions
let webTopicClient: TopicClient | undefined = undefined;

/**
 * Retrieves a new instance of the TopicClient class for web clients.
 * @returns A Promise that resolves to a TopicClient instance.
 */
async function getNewWebClients(): Promise<TopicClient> {
  webTopicClient = undefined;
  const fetchResp = await fetch(authUrl);
  const token = JSON.parse(await fetchResp.text()) as AuthToken;
  //console.log(token);
  const topicClient = new TopicClient({
    configuration: Configurations.Browser.v1(),
    credentialProvider: CredentialProvider.fromString({
      authToken: token.token,
    }),
  });
  webTopicClient = topicClient;
  return topicClient;
}

/**
 * Returns a TopicClient instance for the web.
 * If an instance already exists, it is returned.
 * Otherwise, a new instance is created and returned.
 * @returns A Promise that resolves to a TopicClient instance.
 */
async function getWebTopicClient(): Promise<TopicClient> {
  if (webTopicClient) {
    return webTopicClient;
  }
  return getNewWebClients();
}

/**
 * Subscribes to a topic and listens for updates.
 * @param onItemCb Callback function to handle new items received from the topic.
 * @param onErrorCb Callback function to handle errors that occur while subscribing to the topic.
 * @returns A Promise that resolves to a Subscription object if the subscription is successful.
 * @throws An error if the subscription is unsuccessful.
 */
export async function subscribeToRateTopic(
  onItemCb: (item: TopicItem) => void,
  onErrorCb: (
    error: TopicSubscribe.Error,
    subscription: TopicSubscribe.Subscription,
  ) => Promise<void>,
) {
  const topicClient = await getWebTopicClient();
  const resp = await topicClient.subscribe(cache, topic, {
    onItem: onItemCb,
    onError: onErrorCb,
  });
  if (resp instanceof TopicSubscribe.Subscription) {
    return resp;
  }

  throw new Error(`unable to subscribe to topic: ${resp}`);
}

/**
 * Sends an order to the server and returns the execution result.
 * @param order The order to be sent to the server.
 * @returns A promise that resolves to the execution result.
 */
export async function sendOrder(order: Order): Promise<Execution> {
  let exec = await axios.post<Execution>(orderUrl, order);
  return exec.data;
}

