import React from 'react';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    button: {
        border: 'none',
        borderRadius: 5,
        color: 'white',
        cursor: 'pointer',
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif`,
        fontSize: 16,
        fontWeight: 600,
        outline: 'none',
        padding: '8px 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap'
    },
    colorBlue: {
        backgroundColor: '#2c689c',
        ':hover': {
            backgroundColor: '#4177a5'
        }
    },
    colorGreen: {
        backgroundColor: '#008000',
        ':hover': {
            backgroundColor: '#198c19'
        }
    },
    colorRed: {
        backgroundColor: '#FF0000',
        ':hover': {
            backgroundColor: '#ff3232'
        }
    }
});

function ButtonComponent({ className, color, label, ...props }) {
    let colorClass;
    switch (color) {
        case 'blue':
            colorClass = styles.colorBlue;
            break;
        case 'green':
            colorClass = styles.colorGreen;
            break;
        case 'red':
            colorClass = styles.colorRed;
            break;
        default:
            colorClass = styles.colorBlue;
    }
    return (
        <button
            className={`${css(styles.button, colorClass)} ${className}`}
            style={{ backgroundColor: color }}
            {...props}
        >
            {label}
        </button>
    );
}

export default ButtonComponent;
