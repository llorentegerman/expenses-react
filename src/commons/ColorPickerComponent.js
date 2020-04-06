import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer'
    },
    popover: {
        position: 'absolute',
        zIndex: '2'
    },
    cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
    }
});

function ColorPickerComponent({
    defaultColor = '#FFFFFF',
    onChangeComplete = () => {}
}) {
    const [show, setShow] = useState(false);
    const [color, setColor] = useState(defaultColor);

    return (
        <div>
            <div className={css(styles.swatch)} onClick={() => setShow(!show)}>
                <div
                    style={{
                        width: 36,
                        height: 14,
                        borderRadius: 2,
                        background: color
                    }}
                />
            </div>
            {show ? (
                <div className={css(styles.popover)}>
                    <div
                        className={css(styles.cover)}
                        onClick={() => setShow(!show)}
                    />
                    <SketchPicker
                        color={color}
                        onChangeComplete={color => {
                            setColor(color.hex);
                            onChangeComplete(color.hex);
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default ColorPickerComponent;
