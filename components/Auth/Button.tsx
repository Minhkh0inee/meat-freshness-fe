const Button: React.FC<{
  children: React.ReactNode;
  type?: 'button' | 'submit';
  className?: string;
  loading?: boolean;
}> = ({ children, type = 'button', className = '', loading = false }) => {
  return (
    <button
      type={type}
      disabled={loading}
      className={`
        bg-blue-600 text-white font-medium rounded-lg px-4 py-3 hover:bg-blue-700 
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button