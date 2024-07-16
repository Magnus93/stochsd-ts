export class SubscribePool {
  subscribers: ((message: string) => void)[] = [];
	subscribe(handler: (message: string) => void) {
		this.subscribers.push(handler);
	}
	publish(message: string) {
		for(let i in this.subscribers) {
			this.subscribers[i](message);
		}	
	}
}