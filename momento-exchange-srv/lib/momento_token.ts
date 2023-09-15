import {
    AuthClient,
    CacheClient,
    CacheGet,
    CacheIncrement,
    Configurations,
    CredentialProvider,
    GenerateDisposableToken,
    SubscribeCallOptions,
    TopicClient,
    TopicConfigurations
} from "@gomomento/sdk";
import {
    tokenExpiresIn,
    tokenPermissions
} from "./momento_config";
import { Rate } from "./types";

// Momento clients
const credentialProvider = CredentialProvider.fromEnvironmentVariable({
    environmentVariableName: 'MOMENTO_TOKEN',
});

const authClient = new AuthClient({
    credentialProvider: credentialProvider,
});

export const cacheClient = new CacheClient({
    configuration: Configurations.Laptop.latest(),
    credentialProvider: credentialProvider,
    defaultTtlSeconds: 30,
});

export const topicClient = new TopicClient({
    configuration: TopicConfigurations.Default.latest(),
    credentialProvider: CredentialProvider.fromEnvironmentVariable({
    environmentVariableName: 'MOMENTO_TOKEN',
    }),
});

// functions


/**
 * Retrieves a disposable auth token from Momento API.
 * @returns {Promise<string>} A promise that resolves with the disposable authentication token.
 * @throws {Error} If there was an error retrieving the token.
 */
export async function getToken() {
    return fetchTokenWithOpenAuth().then((response) => {
        if (response instanceof GenerateDisposableToken.Success) {
            console.log('GenToken ', response.authToken.substring(0, 10) + '...');
            return response.authToken;
        } else if (response instanceof GenerateDisposableToken.Error) {
            throw new Error(response.message());
        }
        throw new Error("Unable to get token from momento");
    });
}

/**
 * Fetches a disposable token using the authClient's generateDisposableToken method.
 * @returns A Promise that resolves with the generated disposable token.
 */
async function fetchTokenWithOpenAuth() {
    return authClient.generateDisposableToken(
        tokenPermissions,
        tokenExpiresIn,
    );
}

// Cache
const cacheName = "momento-exchange";
const cacheKey = "rate"; // also ratekey
const inc = "id";

/**
 * Retrieves the cached price from the cache.
 * @returns A Promise that resolves to the cached price as a Rate object, or null if the cache miss.
 * @throws An Error if there was an error retrieving the cached price.
 */
export async function getCachedPrice() {
    return cacheClient.get(cacheName, cacheKey).then((response) => {
        if (response instanceof CacheGet.Hit) {
            return JSON.parse(response.valueString()) as Rate;
        } else if (response instanceof CacheGet.Miss) {
            return null;
        } else if (response instanceof CacheGet.Error) {
            throw new Error(response.message());
        }
    });
}

export function putCachedPrice(rate: Rate) {
    cacheClient.set(cacheName, cacheKey,JSON.stringify(rate));
}

/**
 * Increments the cache value for the specified cache name and returns the new value.
 * @returns A Promise that resolves to the new value of the cache after incrementing.
 * @throws An Error if there was an error incrementing the cache value.
 */
export async function getNewID() {
    return cacheClient.increment(cacheName, inc).then((response) => {
        if (response instanceof CacheIncrement.Success) {
            return response.valueNumber();
        } else if (response instanceof CacheIncrement.Error) {
            throw new Error(response.message());
        }
    });
}

// Topic

export function publish(msg: Rate){
    topicClient.publish(cacheName, cacheKey, JSON.stringify(msg));
}

export function subscribe(option: SubscribeCallOptions){
    topicClient.subscribe(cacheName, cacheKey, option);
}