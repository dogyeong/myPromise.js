var MyPromise = /** @class */ (function () {
    function MyPromise(resolver) {
        var _this = this;
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
        var resolve = function (value) {
            _this.state = 'fulfilled';
            _this.value = value;
            _this.onFulfilled && _this.thenResolve(_this.onFulfilled(_this.value));
        };
        var reject = function (reason) {
            _this.state = 'rejected';
            _this.reason = reason;
            _this.onRejected && _this.thenReject(_this.onRejected(_this.reason));
        };
        resolver(resolve, reject);
    }
    MyPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        if (this.state === 'pending') {
            if (!onFulfilled)
                onFulfilled = function (value) { return value; };
            if (!onRejected)
                onRejected = function (reason) { return reason; };
            this.onFulfilled = onFulfilled;
            this.onRejected = onRejected;
            return new MyPromise(function (resolve, reject) {
                _this.thenResolve = resolve;
                _this.thenReject = reject;
            });
        }
        else if (this.state === 'fulfilled') {
            if (!onFulfilled)
                return this;
            try {
                var result = onFulfilled(this.value);
                if (result instanceof MyPromise)
                    return result;
                return MyPromise.resolve(result);
            }
            catch (e) {
                return MyPromise.reject(e);
            }
        }
        else {
            if (!onRejected)
                return this;
            var result = onRejected(this.reason);
            if (result instanceof MyPromise)
                return result;
            return MyPromise.reject(result);
        }
    };
    MyPromise.prototype["catch"] = function (onRejected) {
        var _this = this;
        if (this.state === 'pending' && !this.onRejected) {
            this.onRejected = onRejected;
            return new MyPromise(function (resolve, reject) {
                _this.thenResolve = resolve;
                _this.thenReject = reject;
            });
        }
        if (this.state !== 'rejected' || !onRejected)
            return this;
        var result = onRejected(this.reason);
        if (result instanceof MyPromise)
            return result;
        return MyPromise.resolve(result);
    };
    MyPromise.resolve = function (value) {
        return new MyPromise(function (resolve) { return resolve(value); });
    };
    MyPromise.reject = function (reason) {
        return new MyPromise(function (_, reject) { return reject(reason); });
    };
    return MyPromise;
}());
// export { MyPromise };
