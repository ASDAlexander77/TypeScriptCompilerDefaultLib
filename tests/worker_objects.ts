// Worker with class instances as messages, both ways. A message is handed over, not copied: under
// -mm=own it moves, so the sender can't use it after postMessage.

class Order {
    constructor(public id: int, public items: string[]) {}
}

class Receipt {
    constructor(public id: int, public count: int, public summary: string) {}
}

function main() {
    const worker = new Worker<Order, Receipt>((self: WorkerScope<Order, Receipt>) => {
        self.onmessage = (e: MessageEvent<Order>) => {
            const order = e.data;
            if (order.id < 0) {
                self.close();
                return;
            }

            self.postMessage(new Receipt(order.id, order.items.length, order.items.join("+")));
        };
    });

    for (let i = 0; i < 1000; i++) {
        const items: string[] = [];
        for (let j = 0; j <= i % 3; j++) items.push(`item${j}`);
        worker.postMessage(new Order(i, items));
    }

    for (let i = 0; i < 1000; i++) {
        const receipt = worker.receive();
        assert(receipt != undefined, "a receipt for every order");
        if (receipt != undefined) {
            assert(receipt.data.id == i, "receipts in order");
            assert(receipt.data.count == i % 3 + 1, "the item count");
            assert(receipt.data.summary.startsWith("item0"), "the summary");
        }
    }

    worker.postMessage(new Order(-1, []));
    worker.join();
    print("ALL DONE");
}
