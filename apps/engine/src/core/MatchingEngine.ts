import { PriceLevel } from "./PriceLevel";
import type { Order } from "./PriceLevel";
export type Side = "buy" | "sell";

export type Trade = {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
};

export class MatchingEngine {
  constructor(
    private bids: Map<number, PriceLevel>, 
    private asks: Map<number, PriceLevel>
  ) {}

  processOrder(order: Order, side: Side): Trade[] {
    if (side === "buy") {
      return this.matchBuy(order);
    } else {
      return this.matchSell(order);
    }
  }

 
  private matchBuy(order: Order): Trade[] {
    const trades: Trade[] = [];

   
    const sortedAskPrices = Array.from(this.asks.keys()).sort((a, b) => a - b);

    for (const price of sortedAskPrices) {
      if (order.quantity === 0) break;
      if (price > order.price) break; 

      const level = this.asks.get(price)!;

      let remaining = order.quantity;

      let currentOrder = level.getBestOrder();

      while (currentOrder && remaining > 0) {
        const tradeQty = Math.min(currentOrder.quantity, remaining);

        trades.push({
          buyOrderId: order.id,
          sellOrderId: currentOrder.id,
          price: price,
          quantity: tradeQty,
          timestamp: Date.now()
        });

        currentOrder.quantity -= tradeQty;
        remaining -= tradeQty;

        if (currentOrder.quantity === 0) {
          level.removeOrder(currentOrder.id);
        }

        currentOrder = level.getBestOrder();
      }

      order.quantity = remaining;

      if (level.isEmpty()) {
        this.asks.delete(price);
      }
    }

    if (order.quantity > 0) {
      this.addToBook(order, "buy");
    }

    return trades;
  }

  private matchSell(order: Order): Trade[] {
    const trades: Trade[] = [];

    const sortedBidPrices = Array.from(this.bids.keys()).sort((a, b) => b - a);

    for (const price of sortedBidPrices) {
      if (order.quantity === 0) break;
      if (price < order.price) break; 

      const level = this.bids.get(price)!;

      let remaining = order.quantity;

      let currentOrder = level.getBestOrder();

      while (currentOrder && remaining > 0) {
        const tradeQty = Math.min(currentOrder.quantity, remaining);

        trades.push({
          buyOrderId: currentOrder.id,
          sellOrderId: order.id,
          price: price,
          quantity: tradeQty,
          timestamp: Date.now()
        });

        currentOrder.quantity -= tradeQty;
        remaining -= tradeQty;

        if (currentOrder.quantity === 0) {
          level.removeOrder(currentOrder.id);
        }

        currentOrder = level.getBestOrder();
      }

      order.quantity = remaining;

      if (level.isEmpty()) {
        this.bids.delete(price);
      }
    }

   
    if (order.quantity > 0) {
      this.addToBook(order, "sell");
    }

    return trades;
  }

  private addToBook(order: Order, side: Side) {
    const book = side === "buy" ? this.bids : this.asks;

    let level = book.get(order.price);

    if (!level) {
      level = new PriceLevel(order.price);
      book.set(order.price, level);
    }

    level.addOrder(order);
  }
}