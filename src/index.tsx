import { useState } from "react";
import ReactDOM from "react-dom";
import { Counter } from "./components/counter";
import { CounterLogic as ComponentInjection } from "./logic/component-injection";
import { CounterLogic as ComponentInjectionWithPropGetter } from "./logic/component-injection-with-prop-getter";
import { CounterLogic as RenderProp } from "./logic/render-callback";
import { CounterWithHook } from "./logic/hooks";

type RenderMethods =
  | "comp-injection"
  | "comp-injection-on-each"
  | "render-prop"
  | "hook";

const RenderMethod: React.FC<{ renderMethod: RenderMethods }> = ({
  renderMethod,
}) => {
  if (renderMethod === "comp-injection") {
    return <ComponentInjection CounterComponent={Counter} />;
  }
  if (renderMethod === "comp-injection-on-each") {
    return (
      <ComponentInjectionWithPropGetter
        CounterComponent={Counter}
        getCounterProps={(index, defaultProps) => ({
          ...defaultProps,
          value: defaultProps.value * index,
        })}
      />
    );
  }
  if (renderMethod === "render-prop") {
    return <RenderProp renderCounter={(props) => <Counter {...props} />} />;
  }
  if (renderMethod === "hook") {
    return <CounterWithHook />;
  }
  return null;
};

const App = () => {
  const [renderMethod, setRenderMethod] =
    useState<RenderMethods>("render-prop");
  const renderMethodOnClick = (method: RenderMethods) => () =>
    setRenderMethod(method);

  return (
    <>
      <h2>Select a render-method:</h2>
      <div>
        <button onClick={renderMethodOnClick("render-prop")}>
          render-prop
        </button>
        <button onClick={renderMethodOnClick("comp-injection")}>
          Component Injection
        </button>
        <button onClick={renderMethodOnClick("comp-injection-on-each")}>
          Component Injection + prop-getter
        </button>
        <button onClick={renderMethodOnClick("hook")}>Custom Hook</button>
      </div>
      <h2>
        Result (<code>{renderMethod}</code>):
      </h2>
      <RenderMethod renderMethod={renderMethod} />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
