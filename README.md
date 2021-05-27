# React Design Patterns for reusing logic
This repo contains small demos of various patterns to separate your logic in React applications.

Index:

* [Hooks](#1-hooks)
* [render-prop](#2-render-prop)
* [Component Injection](#3-component-injection)
* [Component Injection with prop-getter](#4-component-injection-with-prop-getter)


## Common example
All of the following patterns will render a counter that can count up and down.
We assume the tracking of the current value and counting up/down is our "logic" and the rendering of the current value in addition to handling user interaction is our UI-layer.
The UI-layer is the same for all examples:

```tsx
export interface CounterProps {
  value: number;
  countUp(): unknown;
  countDown(): unknown;
}

export const Counter: React.FC<CounterProps> = (props) => {
  const { value, countUp, countDown } = props;
  return (
    <>
      Current Value: {value}
      <button onClick={countUp}>+</button>
      <button onClick={countDown}>-</button>
    </>
  );
};
```

This is a pure component which is easy testable but it misses the state-handling logic.
All of the following patterns will add the logic part to this component.

## Patterns
### 1. Hooks
If you are using function components this should be the way how you are handling reusable logic in your code.

#### Definition
```tsx
export const useCounterLogic = () => {
  const [value, setValue] = useState<number>(0);
  const countUp = () => setValue((currentValue) => currentValue + 1);
  const countDown = () => setValue((currentValue) => currentValue - 1);
  return { value, countUp, countDown };
};
```

#### Usage
```tsx
const CounterWithHook = () => {
  // we could also use the hook directly inside <Counter /> but in this example we
  // do not want to touch the original Counter component's code
  const { value, countUp, countDown } = useCounterLogic();
  return <Counter value={value} countUp={countUp} countDown={countDown} />;
};
```

### 2. render-prop
This was a common pattern in pre-Hook times.
There might be still valid scenarios for this pattern but nowadays you should be using Hooks.
A special form of this pattern is called *Function As Child Component* (FaCC) where the function is passed in the `children` prop.
FaCC is use extensively by libraries like [`downshift`](https://www.npmjs.com/package/downshift) or [`prism-react-renderer`](https://www.npmjs.com/package/prism-react-renderer).

#### Definition
```tsx
interface CounterLogicProps {
  // This is a common signature for render-props.
  // The function receives a bunch of options and must return a
  // valid react node
  renderCounter: (props: CounterProps) => React.ReactNode;
}

export const CounterLogic: React.FC<CounterLogicProps> = (props) => {
  const { renderCounter } = props;
  const [value, setValue] = useState<number>(0);
  const countUp = () => setValue((currentValue) => currentValue + 1);
  const countDown = () => setValue((currentValue) => currentValue - 1);
  // Note: because a React.ReactNode is no valid return type of components
  // we have to wrap the render-prop call inside a React.Fragment
  return <>{renderCounter({ value, countUp, countDown })}</>;
};
```

#### Usage
```tsx
const CounterWithLogic = () => <CounterLogic renderCounter={(props) => <Counter {...props} />} />;
```

### 3. Component Injection
Component Injection is a nice alternative to render-props.
With render-props you often end up rending another component so why not passing component types directly?

💡 Donavon West has published a package called [`render-props`](https://www.npmjs.com/package/render-props) that allows library authors to support both render-props and Component Injection.

#### Definition
```tsx
interface CounterLogicProps {
  // The logic component receives only the element type (Component) it has to render
  CounterComponent: React.ElementType<CounterProps>;
}

export const CounterLogic: React.FC<CounterLogicProps> = (props) => {
  const { CounterComponent } = props;
  const [value, setValue] = useState<number>(0);
  const countUp = () => setValue((currentValue) => currentValue + 1);
  const countDown = () => setValue((currentValue) => currentValue - 1);
  // Note that component-names must start with an uppercase letter.
  return (
    <CounterComponent value={value} countDown={countDown} countUp={countUp} />
  );
};

```

#### Usage
```tsx
const CounterWithLogic = () => <CounterLogic CounterComponent={Counter} />;
```

### 4. Component Injection with prop-getter
This pattern does not really make sense for our example use-case but is an addition to the previous pattern.
You will only need this if you are rendering multiple instances of an injected component
like `<li>` or `<tr>`.
The prop-getter function can return individual props for each rendered instance of the injected component.

#### Definition
```tsx
export interface CounterLogicProps {
  CounterComponent: React.ElementType<CounterProps>;
  getCounterProps: (index: number, defaultProps: CounterProps) => CounterProps;
}

export const CounterLogic: React.FC<CounterLogicProps> = (props) => {
  const { CounterComponent: CounterRenderer, getCounterProps } = props;
  const [value, setValue] = useState<number>(0);
  const countUp = () => setValue((currentValue) => currentValue + 1);
  const countDown = () => setValue((currentValue) => currentValue - 1);
  return (
    <>
      {[0, 1, 2, 3].map((index) => {
        // we ask the received function to give us the final props
        const finalCounterProps = getCounterProps(index, {
          value,
          countUp,
          countDown,
        });
        return (
          <div key={`counter-${index}`}>
            <CounterRenderer {...finalCounterProps} />
          </div>
        );
      })}
    </>
  );
};

```

#### Usage
```tsx
const MultipleCountersWithLogic = () => (
    <ComponentInjectionWithPropGetter
    CounterComponent={Counter}
    // This allows you to specify individual props for each instance of counter
    getCounterProps={(index, defaultProps) => ({
        ...defaultProps,
        value: defaultProps.value * index,
    })}
    />
);
```

## Literature

* Facebook Inc. Render Props – React. https://reactjs.org/docs/render-props.html.
* Facebook Inc. Do Hooks replace render props and higher-order components? – Hooks FAQ. https://reactjs.org/docs/hooks-faq.html#do-hooks-replace-render-props-and-higher-order-components.
* Kent C. Dodds. How to give rendering control to users with prop getters. https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters.
* Kent C. Dodds. React Hooks: What’s going to happen to render props? https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-render-props.
* Donavon West. Function as Child Components Are an Anti-Pattern. American Express Technology https://americanexpress.io/faccs-are-an-antipattern/.
* Donavon West. Support both Hooks and Render Props with One Simple Trick. American Express Technology https://americanexpress.io/hydra/.
