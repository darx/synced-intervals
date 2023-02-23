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
  controller?: AbortController;
}

interface Event {
  event: string;
  handler: Function;
}

class Queue {
  private tracking: Array<number> = [];
  private running: boolean = false;
  private queue: Array<Task> = [];
  private interval: ReturnType<typeof setInterval>;
  private events: Array<Event> = [];

  constructor(queue: Array<Task> = []) {
    this.add = queue;
    this.start();
  }

  private get seconds(): number {
    const now = new Date();
    return now.getSeconds();
  }

  private get now(): number {
    return new Date().getTime();
  }

  private process(task: Task, index: number) {
    const { id, handler, insight } = task;

    if (typeof handler !== "function") return;

    if (this.queue[index]) this.queue[index].pending = true;

    if (this.isEvent("pending")) {
      this.emit("pending", this.pending);
    }

    let track: number | null = !insight ? null : this.now;

    const running = handler.apply(null, []);

    running
      .then((content: any) => {
        if (!insight) return;

        content =
          typeof content === "object"
            ? JSON.stringify(content)
            : String(content);

        const size = content.length;
        const speed = size / ((this.now - Number(track)) / 1000) / 1024;

        track = null;

        this.tracking.push(Number(speed.toFixed(4)));
      })
      .finally(() => {
        if (this.queue[index]) this.queue[index].pending = false;

        if (this.isEvent("pending")) {
          this.emit("pending", this.pending);
        }

        if (insight && track)
          this.tracking.unshift((this.now - Number(track)) / 1000);
        if (this.tracking.length >= 100) this.tracking.pop();

        if (!this.isInterval(task)) return this.remove(id);
      });
  }

  private tick() {
    const time = this.seconds;

    for (let i = 0; i < this.queue.length; i++) {
      const task: Task = this.queue[i];
      const { id, pending, interval } = task;

      if (pending === true) continue;

      if (typeof interval === "number" && time % interval !== 0) continue;
      if (typeof interval !== "number" && this.isPending(id)) continue;

      this.process(task, i);
    }

    if (this.isEvent("status") && time % 15 === 0) {
      this.emit("status", this.average(this.tracking));
    }
  }

  private emit(event: string, data: any) {
    for (let i = 0; i < this.events.length; i++) {
      if (event !== this.events[i].event) continue;
      this.events[i].handler.apply(null, [data]);
    }
  }

  private isPending(id: number | string): boolean {
    return this.queue.some((x: Task) => x.id === id && x.pending);
  }

  private isInterval(x: Task): boolean {
    return typeof x.interval === "number";
  }

  private inQueue(id: number | string): boolean {
    return this.queue.some((x: Task) => x.id === id);
  }

  private isEvent(name: string): boolean {
    return this.events.some((x: Event) => x.event === name);
  }

  private average(arr: Array<number> = []): number {
    const total = arr.reduce((acc, c) => acc + c, 0);
    return total / arr.length;
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

  get insight(): number {
    return this.average(this.tracking);
  }

  get pending(): Array<Task> {
    return this.queue.filter((x: Task) => x.pending);
  }

  includes(id: number | string): Boolean {
    return this.queue.some((x: Task) => x.id == id);
  }

  remove(id: number | string) {
    const index: number = this.queue.findIndex((x: Task) => x.id === id);
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
      this.interval = setInterval(() => this.tick(), 1000);
    }, 1000 - milliseconds);
  }

  on(event: string, handler: Function) {
    this.events.push({ event, handler });
  }
}

export default Queue;
