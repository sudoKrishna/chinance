import { parentPort } from "worker_threads";

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

const SUPPORTED_SYMBOLS = ["BTC/USDT", "ETH/USDT"];

function validate(data: IncomingOrder): string | null {
  const { order, side, symbol } = data;

  if (!order) {
    return "INVALID_ORDER";
  }

  if (!SUPPORTED_SYMBOLS.includes(symbol)) {
    return "INVALID_SYMBOL";
  }

  if (side !== "buy" && side !== "sell") {
    return "INVALID_SIDE";
  }

  if (order.price <= 0) {
    return "INVALID_PRICE";
  }

  if (order.quantity <= 0) {
    return "INVALID_QUANTITY";
  }

  return null;
}

parentPort?.on("message", (data: IncomingOrder) => {
  const error = validate(data);

  if (error) {
    parentPort?.postMessage({
      success: false,
      error,
    });

    return;
  }

  parentPort?.postMessage({
    success: true,
    data,
  });
});