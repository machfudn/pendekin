import React from "react";
import classNames from "classnames";

function MyButton({ children, isActive, className, ...props }) {
  const btnClass = classNames(
    "btn", // base Bootstrap button class
    "fw-semibold", // font weight
    "px-4 py-2", // padding
    "me-2", // right margin (spacing antar tombol)
    "shadow-sm", // small shadow
    "transition", // smooth transition
    "rounded", // rounded corner
    isActive ? "btn-primary" : "",
    className // custom class
  );
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}

export default MyButton;
