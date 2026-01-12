import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-xl border-l-4 ${isSuccess ? 'border-green-500' : 'border-red-500'} dark:text-gray-400 dark:bg-gray-800 transition-all transform animate-slide-in`}>
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${isSuccess ? 'text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200' : 'text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200'}`}>
                {isSuccess ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="sr-only">{isSuccess ? 'Check icon' : 'Error icon'}</span>
            </div>
            <div className="ml-3 text-sm font-normal mr-8 text-gray-800">{message}</div>
            <button
                type="button"
                onClick={onClose}
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
