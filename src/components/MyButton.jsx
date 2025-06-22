import '@/styles/MyButton.css';
function MyButton({ onClick, children, className = 'px-4 py-2 me-2 shadow-sm transition rounded ', type = 'button' }) {
  return (
    <button className={`btn ${className}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export default MyButton;
