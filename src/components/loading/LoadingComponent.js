import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#363740',
        height: '100vh',
        width: '100vw'
    },
    containerLoadingFS: {
        backgroundColor: 'rgba(0,0,0,.5)',
        height: '100%',
        minHeight: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
    },
    containerLoading: {
        backgroundColor: 'rgba(0,0,0,.5)',
        height: '100%',
        minHeight: 210,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000
    },
    loading: {
        border: '16px solid #f3f3f3',
        borderRadius: '50%',
        borderTop: '16px solid #3498db',
        width: 120,
        height: 120,
        '-webkit-animation': 'spin 2s linear infinite',
        animationName: [
            {
                '0%': {
                    transform: 'rotate(0deg)'
                },
                '100%': {
                    transform: 'rotate(360deg)'
                }
            }
        ],
        animationDuration: '2s',
        animationIterationCount: 'infinite'
    },
    loadingSpan: {
        color: 'white',
        marginTop: 10,
        fontSize: 18
    }
});

function InitializingComponent() {
    return (
        <Column
            className={css(styles.container)}
            horizontal="center"
            vertical="center"
        >
            <div className={css(styles.loading)}></div>
            <span className={css(styles.loadingSpan)}>Loading...</span>
        </Column>
    );
}

function LoadingComponent({ children, loading, fullScreen }) {
    return (
        <div style={{ position: 'relative' }}>
            {loading && (
                <Column
                    className={css(
                        fullScreen
                            ? styles.containerLoadingFS
                            : styles.containerLoading
                    )}
                    horizontal="center"
                    vertical="center"
                >
                    <div className={css(styles.loading)}></div>
                    <span className={css(styles.loadingSpan)}>Loading...</span>
                </Column>
            )}
            {children}
        </div>
    );
}

export { LoadingComponent, InitializingComponent };
