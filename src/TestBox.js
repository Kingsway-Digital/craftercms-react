import React from "react";

export function TestBox(props) {
  const { children } = props;
  console.log("Hello from testbox6");
  return (
    <>
      <h1>Hello from TestBox6</h1>
      {children}
    </>
  );
}
