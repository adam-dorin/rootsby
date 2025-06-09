/**
 * @description Generate an observable instance according to the observable pattern
 * @description Example of use:
 * @description `const o = new Observable<boolean>();`
 */
export class Observable<DataType> {
  private observers: Observer<DataType>[] = [];
  private readonly cacheData: { [name: string]: DataType } = {};
  private readonly isCaching: boolean;
  private logger?: (name: string, data: DataType) => void;

  constructor(cache = true) {
    this.isCaching = cache;
  }

  /**
   * @description Log the data send to any subscriber
   * @param {String} name
   * @param {DataType} data
   * @returns void
   */
  private log(name: string, data: DataType): void {
    if (this.logger) {
      this.logger(name, data);
    }
  }

  /**
   * @description Stop receiving changes from this particular observer
   * @param {Number} index
   * @returns void
   */
  private unsubscribe(index: number): void {
    // TODO: still need to add tests for this
    this.observers = this.observers.filter((_, ObsIndex: number) => ObsIndex !== index);
  }

  /**
   * @description Subscribe to changes or function calls from a specific name
   * @param {String} name
   * @param {Function} subscriber
   * @returns Subscription
   */
  public subscribe(name: string, subscriber: (data: DataType) => void): Subscription {
    this.observers.push({ name, subscribeFunction: subscriber });
    const index = this.observers.length - 1;
    if (this.isCaching && this.cacheData[name]) {
      // TODO: still need to add tests for this
      this.observers[index].subscribeFunction(this.cacheData[name]);
    }

    return {
      unsubscribe: () => this.unsubscribe(index),
    } as Subscription;
  }

  /**
   * @description Stop all subscribers from receiving changes from this name
   * @param {String} name
   * @returns void
   */
  public unsubscribeAll(name: string): void {
    this.observers = this.observers.filter((observer) => observer.name !== name);
    if (this.isCaching && this.cacheData[name]) {
      // TODO: still need to add tests for this
      delete this.cacheData[name];
    }
  }

  /**
   * @description Send data to all subscribers
   * @param {String} name
   * @param {DataType} data
   */
  public push(name: string, data: DataType): void {
    this.observers.filter((obs) => obs.name === name).forEach((observer) => observer.subscribeFunction(data));
    this.log(name, data);
    if (this.isCaching) {
      this.cacheData[name] = data;
    }
  }
  public setLogger(logger: (name: string, data: DataType) => void): void {
    this.logger = logger;
  }
}

/**
 * @description Return type for the Subscribe function
 */
export interface Subscription {
  unsubscribe: () => void;
}

/**
 * @description Instance description of the objects stored in the observers Array
 */
interface Observer<D> {
  name: string;
  subscribeFunction: (data: D) => void;
}
