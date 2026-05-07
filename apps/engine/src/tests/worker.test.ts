import { describe, it, expect } from "vitest";
import { Worker } from "worker_threads";

describe("validator.worker", () => {
  it("accepts valid orders", async () => {
    const worker = new Worker(
      new URL("../workers/validator.worker.ts", import.meta.url)
    );

    const result = await new Promise<any>((resolve) => {
      worker.once("message", resolve);

      worker.postMessage({
        symbol: "BTC/USDT",
        side: "buy",
        order: {
          id: "o1",
          price: 50000,
          quantity: 1,
          timestamp: Date.now(),
        },
      });
    });

    expect(result.success).toBe(true);

    await worker.terminate();
  });

  it("rejects invalid price", async () => {
    const worker = new Worker(
      new URL("../workers/validator.worker.ts", import.meta.url)
    );

    const result = await new Promise<any>((resolve) => {
      worker.once("message", resolve);

      worker.postMessage({
        symbol: "BTC/USDT",
        side: "buy",
        order: {
          id: "o2",
          price: -1,
          quantity: 1,
          timestamp: Date.now(),
        },
      });
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("INVALID_PRICE");

    await worker.terminate();
  });
});

describe("matching.worker", () => {
  it("processes orders", async () => {
    const worker = new Worker(
      new URL("../workers/matching.worker.ts", import.meta.url)
    );

    const result = await new Promise<any>((resolve) => {
      worker.once("message", resolve);

      worker.postMessage({
        symbol: "BTC/USDT",
        side: "buy",
        order: {
          id: "b1",
          price: 50000,
          quantity: 1,
          timestamp: Date.now(),
        },
      });
    });

    expect(result.success).toBe(true);
    expect(result.snapshot).toBeDefined();

    await worker.terminate();
  });
});

describe("publisher.worker", () => {
  it("publishes trades", async () => {
    const worker = new Worker(
      new URL("../workers/publisher.worker.ts", import.meta.url)
    );

    const result = await new Promise<any>((resolve) => {
      worker.once("message", resolve);

      worker.postMessage({
        trades: [
          {
            id: "t1",
            price: 50000,
            quantity: 1,
          },
        ],
      });
    });

    expect(result.success).toBe(true);

    await worker.terminate();
  });
});