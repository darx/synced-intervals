type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

interface Task {
  id: number | string;
  handler: Function;
  pending?: boolean;
  interval?: undefined | IntRange<1, 59>;
  immediate?: boolean;
  insight?: boolean;
}

class Queue {
  private tracking: Array<number> = [];
  private running: boolean = false;
  private queue: Array<Task> = [];
  private interval: ReturnType<typeof setInterval>;

  constructor(queue: Array<Task> = []) {
    this.add = queue;
    this.start();
  }

  private get seconds(): number {
    const now = new Date();
    return now.getSeconds();
  }

  private get now(): number {
    return new Date().getTime()
  }

  private clock() {
    const time = this.seconds;

    console.log(time);

    for (let i = 0; i < this.queue.length; i++) {
      const task: Task = this.queue[i];

      const { id, handler, pending, interval, insight } = task;

      if (pending === true) continue;

      if (typeof interval === "number" && time % interval !== 0) continue;
      if (typeof interval !== "number" && this.isPending(id)) continue;

      this.queue[i].pending = true;

      const track = !insight ? null : this.now;

      const running = handler.apply(null, []);

      running.finally(() => {
        this.queue[i].pending = false;

        if (track) this.tracking.unshift(this.now - track);

        if (this.tracking.length >= 100) this.tracking.pop();

        console.log(this.tracking);

        if (!this.isInterval(task)) return this.remove(id);
      });
    }
  }

  set add(val: Task | Array<Task>) {
    if (!Array.isArray(val)) val = [val];

    for (let i = 0; i < val.length; i++) {
      const x = val[i];

      if (this.isInterval(x) && this.inQueue(x.id)) continue;

      if (x.immediate) x.handler.apply(null, []);
    }

    this.queue.push(...val);
  }

  private isPending(id: number | string): boolean {
    return this.queue.some((x) => x.id === id && x.pending);
  }

  private isInterval(x: Task): boolean {
    return typeof x.interval === "number";
  }

  private inQueue(id: number | string): boolean {
    return this.queue.some((x) => x.id === id);
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

  get pending(): Array<Task> {
    return this.queue.filter((x) => x.pending);
  }
}

export default Queue;
