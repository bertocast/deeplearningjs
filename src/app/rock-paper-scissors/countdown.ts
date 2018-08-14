export default class CountDownTimer {
  private readonly duration: number;
  private readonly granularity: any;
  private tickFns: any[];
  private _running: boolean;
  private startTime: number;

  constructor(duration, granularity) {
    this.duration = duration;
    this.granularity = granularity;
    this.tickFns = [];
    this._running = false;
  }

  start() {
    if (this._running) {
      return;
    }
    this._running = true;
    const tickerFn = () => {
      let diff = this.duration - (Date.now() - this.startTime);
      if (diff > 0) {
        setTimeout(tickerFn, this.granularity);
      } else {
        diff = 0;
        this._running = false;
      }
      this.tickFns.forEach((fn) => {
        fn(diff);
      });
    };
    this.startTime = Date.now();
    tickerFn();
  }


  get running(): boolean {
    return this._running;
  }

  addTickFn(fn) {
    this.tickFns.push(fn);
  }

}
