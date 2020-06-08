import React, { forwardRef } from 'react';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    inputField: {
        height: 40,
        fontSize: 16,
        padding: 0,
        margin: 0,
        marginTop: 4,
        width: 'calc(100% - 4px)'
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
