interface Task {
  id: number | string;
  handler: Function;
  pending?: boolean;
  interval?: any;
  immediate?: boolean;
  insight?: boolean;
}

class Queue {
  private running: boolean = false;
  private queue: Array<Task> = [];
  private interval: ReturnType<typeof setInterval>;

  constructor(queue: Array<Task> = []) {
    this.add = queue;
    this.start();
  }

  private get seconds() {
    const now = new Date();
    return now.getSeconds();
  }

  private clock() {
    const time = this.seconds;

    console.log(time);

    for (let i = 0; i < this.queue.length; i++) {
      const task: Task = this.queue[i];

      const { id, handler, pending, interval } = task;

      if (pending === true) continue;

      if (typeof interval === "number" && time % interval !== 0) continue;
      if (typeof interval === "undefined" && this.isPending(id)) continue;

      this.queue[i].pending = true;

      const running = handler.apply(null, []);

      running.finally(() => {
        this.queue[i].pending = false;
        if (typeof interval === "undefined") return this.remove(id);
      });
    }
  }

  set add(val: Task | Array<Task>) {
    if (!Array.isArray(val)) val = [val];

    for (let i = 0; i < val.length; i++) {
      const x = val[i];

      if (x.interval > 59) {
        val.splice(i, 1);
        console.warn("Interval can't be greater than 59 seconds, not added to queue", x);
        continue;
      }
      if (x.immediate) x.handler.apply(null, []);
    }

    this.queue.push(...val);
  }

  private isPending(id: number | string) {
    return this.queue.some((x) => x.id === id && x.pending);
  }

  remove(id: number | string) {
    const index: number = this.queue.findIndex((x) => x.id === id);
    if (index === -1) return;
    this.queue.splice(index, 1);
  }

  stop() {
    clearInterval(this.interval);
    this.running = false;
  }

  start() {
    if (this.running === true) return this.running;
    this.running = true;

    const milliseconds = new Date().getMilliseconds();
    setTimeout(() => {
      this.interval = setInterval(() => this.clock(), 1000);
    }, 1000 - milliseconds);
  }
}

export default Queue;
