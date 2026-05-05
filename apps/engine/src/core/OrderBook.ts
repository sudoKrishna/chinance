type Order = {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
};

export class OrderBook {
  private bids: Order[] = [];
  private asks: Order[] = [];

  addOrder(order: Order, side: "buy" | "sell") {
    const newOrder = { ...order };

    if (side === "buy") {
      this.matchBuyOrder(newOrder);
    } else {
      this.matchSellOrder(newOrder);
    }
  }

  cancelOrder(orderId: string) {
    this.bids = this.bids.filter(o => o.id !== orderId);
    this.asks = this.asks.filter(o => o.id !== orderId);
  }

  getBestBid() {
    return this.bids[0] ?? null;
  }

  getBestAsk() {
    return this.asks[0] ?? null;
  }

  getSnapshot() {
    return {
      bids: this.bids.slice(0, 10),
      asks: this.asks.slice(0, 10),
    };
  }

  private matchBuyOrder(order: Order) {
    while (this.asks.length) {
      const bestAsk = this.asks[0];

      if (!bestAsk || order.price < bestAsk.price) break;

      const tradeQty = Math.min(order.quantity, bestAsk.quantity);

      order.quantity -= tradeQty;
      bestAsk.quantity -= tradeQty;

      if (bestAsk.quantity === 0) this.asks.shift();
      if (order.quantity === 0) return;
    }

    this.bids.push(order);
    this.bids.sort(
      (a, b) => b.price - a.price || a.timestamp - b.timestamp
    );
  }

  private matchSellOrder(order: Order) {
    while (this.bids.length) {
      const bestBid = this.bids[0];

      if (!bestBid || order.price > bestBid.price) break;

      const tradeQty = Math.min(order.quantity, bestBid.quantity);

      order.quantity -= tradeQty;
      bestBid.quantity -= tradeQty;

      if (bestBid.quantity === 0) this.bids.shift();
      if (order.quantity === 0) return;
    }

    this.asks.push(order);
    this.asks.sort(
      (a, b) => a.price - b.price || a.timestamp - b.timestamp
    );
  }
}