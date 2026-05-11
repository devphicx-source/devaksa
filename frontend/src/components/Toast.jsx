import React from 'react';

const Toast = ({ message, type, onHide }) => {
    return (
        <div className={`toast-container ${type}`} onClick={onHide}>
            <div className="toast-content">
                <i className={type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}></i>
                <span>{message}</span>
            </div>
            <div className="toast-progress"></div>
        </div>
    );
};

export default Toast;
