const Toast = ({ type, message, onClose }) => {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center p-4 mb-4 text-sm rounded-lg ${
          type === 'success' 
            ? 'text-green-800 bg-green-50' 
            : 'text-red-800 bg-red-50'
        }`} role="alert">
          <span className="font-medium">{message}</span>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  export default Toast;