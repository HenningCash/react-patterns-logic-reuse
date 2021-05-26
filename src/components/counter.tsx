import React from "react";

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
