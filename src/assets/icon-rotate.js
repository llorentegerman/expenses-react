import React from 'react';

export default ({ color, ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        {...props}
        xmlns="http://www.w3.org/2000/svg"
    >
        <g
            id="Icons"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
        >
            <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
            <path
                d="M11.95,24 C12.18,24 12.39,23.98 12.61,23.97 L8.8,20.15 L7.47,21.49 C4.2,19.93 1.86,16.76 1.5,13 L0,13 C0.51,19.16 5.66,24 11.95,24 Z M12.05,0 C11.82,0 11.61,0.02 11.39,0.04 L15.2,3.85 L16.53,2.52 C19.8,4.07 22.14,7.24 22.5,11 L24,11 C23.49,4.84 18.34,0 12.05,0 Z M16,6 L10,6 L10,8 L16,8 L16,14 L18,14 L18,8 C18,6.89 17.1,6 16,6 Z M18,18 L20,18 L20,16 L8,16 L8,4 L6,4 L6,6 L4,6 L4,8 L6,8 L6,16 C6,17.1 6.89,18 8,18 L16,18 L16,20 L18,20 L18,18 Z"
                id="🔹-Primary-Color"
                fill={color || '#1D1D1D'}
            ></path>
        </g>
    </svg>
);
