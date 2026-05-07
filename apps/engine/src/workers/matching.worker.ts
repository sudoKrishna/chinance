import { parentPort } from "worker_threads";

import { OrderBook } from "../core/OrderBook.ts";

type Order = {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
};

type IncomingOrder = {
  order: Order;
  side: "buy" | "sell";
  symbol: string;
};

// shared memory
const sharedBuffer = new SharedArrayBuffer(1024 * 1024);

// orderbook instance
const orderBook = new OrderBook();

parentPort?.on("message", (message: IncomingOrder) => {
  try {
    const { order, side } = message;

    // before snapshot
    const before = orderBook.getSnapshot();

    // add + match
    orderBook.addOrder(order, side);

    // after snapshot
    const after = orderBook.getSnapshot();

    parentPort?.postMessage({
      success: true,
      snapshot: after,
      before,
    });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: "MATCHING_FAILED",
    });
  }
});