export type Order = {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
};

class OrderNode {
  order: Order;
  prev: OrderNode | null = null;
  next: OrderNode | null = null;

  constructor(order: Order) {
    this.order = order;
  }
}

export class PriceLevel {
  price: number;
  totalQuantity: number = 0;

  private head: OrderNode | null = null;
  private tail: OrderNode | null = null;

  private orderMap: Map<string, OrderNode> = new Map();

  constructor(price: number) {
    this.price = price;
  }

  addOrder(order: Order) {
    const node = new OrderNode(order);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      if (this.tail) {
        this.tail.next = node;
        node.prev = this.tail;
        this.tail = node;
      }
    }

    this.orderMap.set(order.id, node);
    this.totalQuantity += order.quantity;
  }

  removeOrder(orderId: string): boolean {
    const node = this.orderMap.get(orderId);
    if (!node) return false;

    this.totalQuantity -= node.order.quantity;
    this.orderMap.delete(orderId);

    const prev = node.prev;
    const next = node.next;

    if (prev) prev.next = next;
    else this.head = next;

    if (next) next.prev = prev;
    else this.tail = prev;

    node.prev = null;
    node.next = null;

    return true;
  }

  
  match(quantity: number): number {
    let remaining = quantity;

    let current = this.head;

    while (current && remaining > 0) {
      const order = current.order;

      const tradeQty = Math.min(order.quantity, remaining);

      order.quantity -= tradeQty;
      remaining -= tradeQty;
      this.totalQuantity -= tradeQty;

      const nextNode = current.next;

      if (order.quantity === 0) {
        this.removeOrder(order.id);
      }

      current = nextNode;
    }

    return remaining;
  }

  getBestOrder(): Order | null {
    return this.head?.order ?? null;
  }

  isEmpty(): boolean {
    return this.head === null;
  }
}