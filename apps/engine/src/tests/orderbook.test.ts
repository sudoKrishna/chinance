import { describe, it, expect } from "vitest";
import { OrderBook } from "../core/OrderBook";

describe("OrderBook", () => {
  it("matches full orders", () => {
    const ob = new OrderBook();

    ob.addOrder({ id: "s1", price: 100, quantity: 5, timestamp: 1 }, "sell");
    ob.addOrder({ id: "b1", price: 100, quantity: 5, timestamp: 2 }, "buy");

    expect(ob.getBestBid()).toBeNull();
    expect(ob.getBestAsk()).toBeNull();
  });

it("handles partial fills", () => {
  const ob = new OrderBook();

  ob.addOrder({ id: "s1", price: 100, quantity: 10, timestamp: 1 }, "sell");
  ob.addOrder({ id: "b1", price: 100, quantity: 4, timestamp: 2 }, "buy");

  const bestAsk = ob.getBestAsk();

  expect(bestAsk).not.toBeNull();
  expect(bestAsk!.id).toBe("s1");
  expect(bestAsk!.quantity).toBe(6);
});

 it("respects price-time priority", () => {
  const ob = new OrderBook();

  ob.addOrder({ id: "b1", price: 100, quantity: 5, timestamp: 1 }, "buy");
  ob.addOrder({ id: "b2", price: 100, quantity: 5, timestamp: 2 }, "buy");

  const snapshot = ob.getSnapshot();

  expect(snapshot.bids.map(o => o.id)).toEqual(["b1", "b2"]);
});
});