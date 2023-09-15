/**
 * This file contains the implementation of a Fastify server that provides an API for exchanging tokens.
 * It defines two types, Order and Execution, and their corresponding typescript types.
 * The server has two endpoints: /auth and /order.
 * The /auth endpoint returns an authentication token.
 * The /order endpoint places an order and returns an execution object.
 * The server listens on port 3333.
 */

import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import Fastify from "fastify";
import { getCachedPrice, getNewID, getToken } from "./lib/momento_token";

// type definitions
const Order = Type.Object({
    price: Type.Number(),
    amount: Type.Number(),
    side: Type.Union([Type.Literal('buy'), Type.Literal('sell')]),
})

const Execution = Type.Object({
    id: Type.String(),
    price: Type.Number(),
    amount: Type.Number(),
    side: Type.Union([Type.Literal('buy'), Type.Literal('sell')]),
    executed_price: Type.Optional(Type.Number()),
    executed_time: Type.Optional(Type.String()),
    status: Type.Union([Type.Literal('done'), Type.Literal('nothing')]),
})

type OrderType = Static<typeof Order>
type ExecutionType = Static<typeof Execution>

const server = Fastify().withTypeProvider<TypeBoxTypeProvider>();

server.register(cors, {
    // put your options here
})

/**
 * @api {get} /auth Get auth token
 */
server.get('/auth', async (request, reply) => {
    let auth_token = await getToken();
    reply
        .header('Cache-Control', 'no-cache')
        .send({ token: auth_token });
})

// allowed slippage
const slippage = 50;

/**
 * @api {post} /order Place order
 */
server.post<{ Body: OrderType, Reply: ExecutionType }>('/order',
    {
        schema: {
            body: Order,
            response: {
                200: Execution
            }
        }
    },
    async (request, reply) => {
        const order = request.body;
        const cachedPrice = await getCachedPrice();
        const serial = await getNewID();
        if (cachedPrice && serial) {
            console.log("Execution latency", new Date().getTime() - new Date(cachedPrice.timestamp).getTime(), "ms");
            if (order.side === 'buy' && order.price + slippage >= cachedPrice.best_ask) {
                reply.status(200).send(execute(serial, order, cachedPrice.best_ask));
            } else if (order.side === 'sell' && order.price - slippage <= cachedPrice.best_bid) {
                reply.status(200).send(execute(serial, order, cachedPrice.best_bid));
            } else {
                reply.status(200).send(nothing(serial));
            }
        } else {
            reply.status(200).send(nothing());
        }

        function nothing(serial?: number): ExecutionType {
            return {
                id: serial ? serial.toString() : '',
                price: order.price,
                amount: order.amount,
                side: order.side,
                status: 'nothing'
            };
        }

        function execute(serial: number, order: OrderType, price: number): ExecutionType {
            return {
                id: serial.toString(),
                price: order.price,
                amount: order.amount,
                side: order.side,
                executed_price: price,
                executed_time: new Date().toLocaleString("ja-JP"),
                status: 'done'
            } as ExecutionType;
        }
    }
)

server.listen({ port: 3333 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})


