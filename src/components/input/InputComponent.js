import React, { forwardRef } from 'react';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    inputField: {
        height: 40,
        fontSize: 16,
        padding: '1px 2px',
        margin: 0,
        marginTop: 4,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    }
});

function InputComponent(props, ref) {
    return (
        <input
            type="text"
            {...props}
            className={css(styles.inputField)}
            ref={ref}
        />
    );
}

export default forwardRef(InputComponent);
