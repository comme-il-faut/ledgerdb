export default function traceMethodCalls(obj) {
  const handler = {
    construct(target, argumentsList, newTarget) {
      const instance = Reflect.construct(target, argumentsList, newTarget);
      return new Proxy(instance, handler);
    },
    get(target, propertyKey, receiver) {
      const value = Reflect.get(target, propertyKey, receiver);
      const className = target.name ||
        (target.__proto__ &&
         target.__proto__.constructor &&
         target.__proto__.constructor.name) || undefined;
      if (typeof(value) === 'function') {
        console.log("==> " + className + " -> " + propertyKey);
      }
      return value;
    }
  };
  return new Proxy(obj, handler);
}
