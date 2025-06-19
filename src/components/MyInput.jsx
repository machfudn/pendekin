// src/components/MyInput.jsx
import React from "react";

function MyInput({ type = "text", name, autoComplete, id, className = "form-control mb-2", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      autoComplete={autoComplete}
      name={name}
      id={id}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default MyInput;
