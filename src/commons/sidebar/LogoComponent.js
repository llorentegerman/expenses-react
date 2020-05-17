import React from 'react';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import Logo from '../../assets/icon-dollar';

const styles = StyleSheet.create({
    container: {
        marginLeft: 32,
        marginRight: 32
    },
    title: {
        fontFamily: 'Muli',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 19,
        lineHeight: '24px',
        letterSpacing: '0.4px',
        color: '#A4A6B3',
        opacity: 0.7,
        marginLeft: 12
    },
    wrapper: {
        padding: 10,
        paddingTop: 5,
        backgroundColor: '#2c689c',
        borderRadius: 40
    }
});

function LogoComponent() {
    return (
        <Row
            className={css(styles.container)}
            horizontal="center"
            vertical="center"
        >
            <div className={css(styles.wrapper)}>
                <Logo stroke="white" />
            </div>
            <span className={css(styles.title)}>Expenses</span>
        </Row>
    );
}

export default LogoComponent;
