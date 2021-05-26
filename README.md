# React Design Patterns for reusing logic
This repo contains a small demo of various patterns to separate your logic in React application.

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

## Patterns
### 1. Hooks
If you are using function components this should be the way how you are handling reusable logic in your code.

#### Definition
```tsx
export const useCounterLogic = () => {
  const [value, setValue] = useState<number>(0);
  const countUp = () => setValue((currentValue) => currentValue + 1);
  const countDown = () => setValue((currentValue) => currentValue - 1);
  return {
    value,
    countUp,
    countDown,
  };
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
const CounterWithRenderProp = () => <RenderProp renderCounter={(props) => <Counter {...props} />} />;
```

### 3. Component Injection
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
This pattern does not really make sense for our example use-case.
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
const MultipleCounterWithLogic = () => (
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