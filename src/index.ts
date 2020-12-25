class MyPromise {
  public state: 'pending' | 'fulfilled' | 'rejected';
  public value: any;
  public reason: any;
  private onFulfilled: any;
  private onRejected: any;
  private thenResolve: any;
  private thenReject: any;

  constructor(resolver: (resolve: (value: any) => void, reject: (reason: any) => void) => any) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilled = undefined;
    this.onRejected = undefined;
    this.thenResolve = undefined;
    this.thenReject = undefined;

    if (typeof resolver !== 'function') {
      throw new Error('resolver is not a function');
    }

    const resolve = (value: any) => {
      this.state = 'fulfilled';
      this.value = value;
      this.onFulfilled && this.thenResolve(this.onFulfilled(this.value));
    };
    const reject = (reason: any) => {
      this.state = 'rejected';
      this.reason = reason;
      this.onRejected && this.thenReject(this.onRejected(this.reason));
    };

    resolver(resolve, reject);
  }

  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    if (this.state === 'pending') {
      if (!onFulfilled) onFulfilled = (value) => value;
      if (!onRejected) onRejected = (reason) => reason;

      this.onFulfilled = onFulfilled;
      this.onRejected = onRejected;

      return new MyPromise((resolve, reject) => {
        this.thenResolve = resolve;
        this.thenReject = reject;
      });
    } else if (this.state === 'fulfilled') {
      if (!onFulfilled) return this;

      try {
        const result = onFulfilled(this.value);

        if (result instanceof MyPromise) return result;

        return MyPromise.resolve(result);
      } catch (e) {
        return MyPromise.reject(e);
      }
    } else {
      if (!onRejected) return this;

      const result = onRejected(this.reason);

      if (result instanceof MyPromise) return result;

      return MyPromise.reject(result);
    }
  }

  catch(onRejected?: (reason: any) => any) {
    if (this.state === 'pending' && !this.onRejected) {
      this.onRejected = onRejected;

      return new MyPromise((resolve, reject) => {
        this.thenResolve = resolve;
        this.thenReject = reject;
      });
    }

    if (this.state !== 'rejected' || !onRejected) return this;

    const result = onRejected(this.reason);

    if (result instanceof MyPromise) return result;

    return MyPromise.resolve(result);
  }

  static resolve(value: any) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason: any) {
    return new MyPromise((_, reject) => reject(reason));
  }
}

// export { MyPromise };
