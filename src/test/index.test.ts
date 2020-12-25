import { MyPromise } from '../index';

test('resolve또는 reject를 호출하지 않으면 pending 상태여야 한다', () => {
  const promise = new MyPromise(() => {});
  expect(promise.state).toBe('pending');
});

describe('resolve함수를 호출할 때', () => {
  test('상태는 fulfilled가 되어야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(1));
    expect(promise.state).toBe('fulfilled');
  });

  test('전달받은 값을 resolve해야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(100));
    return expect(promise).resolves.toBe(100);
  });

  test('비동기적으로 호출되면 호출되고 나서 resolve되어야 한다', () => {
    const promise = new MyPromise((resolve) => setTimeout(() => resolve(200), 10));
    expect(promise.state).toBe('pending');
    return expect(promise).resolves.toBe(200);
  });
});

describe('reject함수를 호출하면', () => {
  test('상태는 rejected가 되어야 한다', () => {
    const promise = new MyPromise((resolve, reject) => reject(2));
    expect(promise.state).toBe('rejected');
  });

  test('전달받은 값을 reject해야 한다', () => {
    const promise = new MyPromise((resolve, reject) => reject(3));
    expect(promise.reason).toBe(3);
  });
});

describe('then 메소드를 사용할 때', () => {
  test('onFulfilled가 함수가 아니면 무시되야 한다', () => {
    const promise = new MyPromise((resolve) => resolve('hi'));
    const afterThen = promise.then();
    expect(afterThen.state).toBe('fulfilled');
    expect(afterThen.value).toBe('hi');
  });

  test('onFulfilled 함수는 프로미스의 value를 파라미터로 받아야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(100));
    return expect(promise.then((result) => result + 200)).resolves.toBe(300);
  });

  test('then을 체이닝할 수 있어야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(100));
    const promise2 = promise
      .then((res) => res + 100)
      .then((res) => res * 2)
      .then((res) => res - 100);
    return expect(promise2).resolves.toBe(300);
  });

  test('onFulfilled 함수가 프로미스를 반환하면 then은 그 프로미스를 반환해야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(100)).then(
      (res) => new MyPromise((resolve) => resolve(res + 100))
    );
    return expect(promise).resolves.toBe(200);
  });

  test('onFulfilled 함수가 비동기함수를 가진 promise라도 제대로 순서대로 실행되어야 한다', () => {
    const promise = new MyPromise((resolve) => resolve(100)).then(
      (res) => new MyPromise((resolve) => setTimeout(() => resolve(res + 200), 10))
    );
    return expect(promise).resolves.toBe(300);
  });
});

describe('catch 메소드를 사용할 때', () => {
  test('onRejected가 함수가 아니면 무시되야 한다', () => {
    const promise = new MyPromise((resolve) => resolve('hi'));
    const promise2 = promise.catch();
    expect(promise2.state).toBe('fulfilled');
    expect(promise2.value).toBe('hi');
  });

  test('onRejected 함수는 프로미스의 reason를 파라미터로 받아야 한다', () => {
    const promise = new MyPromise((resolve, reject) => reject(100));
    let result;
    promise.catch((reason) => (result = reason + 200));
    expect(result).toBe(300);
  });

  test('then에서 onFulfilled 함수가 에러를 던지면 catch에서 잡아야 한다', () => {
    let result;
    const promise = new MyPromise((resolve) => resolve(100))
      .then((res) => {
        throw new Error('e-');
      })
      .then((res) => (result = res + 'then'))
      .catch((res) => (result = res + 'catch'));

    expect(result).toBe('Error: e-catch');
  });

  test('then에서 onFulfilled 함수가 비동기로 에러를 던지면 catch에서 잡아야 한다', async () => {
    let result: any;
    await new Promise((promiseRes, promiseRej) =>
      new MyPromise((resolve) => resolve(100))
        .then((res) => new MyPromise((resolve, reject) => setTimeout(() => reject(new Error('e-')), 10)))
        .then((res) => (result = res + 'then'))
        .catch((res) => (result = res + 'catch'))
        .then(() => promiseRes(''))
    );
    expect(result).toBe('Error: e-catch');
  });
});
