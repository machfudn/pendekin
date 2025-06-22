import '@/styles/MyInput.css';
function MyInput({ type = 'text', name, autoComplete, id, className = 'form-control mb-2', placeholder, value, onChange, ...props }) {
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
      {...props}
    />
  );
}

export default MyInput;
