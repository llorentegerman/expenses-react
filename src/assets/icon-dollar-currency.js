import React from 'react';

export default (props) => (
    <svg viewBox="0 0 24 24" stroke={props.fill || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path opacity={props.opacity || ''} d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);
