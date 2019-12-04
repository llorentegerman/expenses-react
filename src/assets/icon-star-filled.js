import React from 'react';

export default (props) => (
	<svg viewBox="2 2 20 19" {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
		<g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
			<polygon id="Path" fillRule="nonzero" points="0 0 24 0 24 24 0 24"></polygon>
			<polygon fill={props.fill || "#1D1D1D"} points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21"></polygon>
		</g>
	</svg>
);
