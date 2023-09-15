# Momento Topics Example 

This directory contains an example of how to implement the Momento Topics to publish real-time price to multiple clients. 
There are three server-side modules in this project.

## Prerequisite

You need to copy ``.env.sh.template`` to `.env.sh` and modify it with your own Momento Auth Token. 
Then setup the project as follows:

```
npm install
source .env.sh
```

## 1. rate_publisher

This process gets current BTCJPY price from [bitflyer lightning](https://lightning.bitflyer.com/) then publish it to the momento Topics. This process must be started along with exchange_api

```
> npx ts-node rate_publisher.ts
```

## 2. rate_subscriber (option)

This process gets message from the topic and print the value on the standard output. This is useful for monitoring.

```
> npx ts-node rate_subscriber.ts
```

## 3. exchange_api

This process is the backend of the frontend application. It provides two endpoints, one for temporary token and the other is sending the order.

```
> npx ts-node exchange_api.ts
```