import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { useExpenses } from '../../logic/useExpenses';
import { LoadingComponent } from '../../commons/InitializingComponent';
import GoogleButton from '../../assets/google_button.jpg';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#363740',
        height: '100%',
        minHeight: '100vh',
        padding: 10
    },
    loginBox: {
        backgroundColor: '#F7F8FC',
        border: '1px solid #3498db',
        borderRadius: 6,
        width: '100%',
        maxWidth: 300,
        height: '100%',
        maxHeight: 300
    },
    loginTitle: {
        fontSize: 20,
        marginTop: 20,
        marginBottom: 20
    },
    googleLoginButton: {
        padding: 4,
        background: 'white',
        color: '#444',
        width: '80%',
        borderRadius: 5,
        border: 'thin solid #888',
        boxShadow: '1px 1px 1px grey',
        whiteWpace: 'nowrap',
        ':hover': {
            cursor: 'pointer'
        },
        ':nth-child(n) > div > span': {
            verticalAlign: 'middle',
            fontSize: 14,
            fontWeight: 'bold'
            /* Use the Roboto font that is loaded in the <head> */
            // fontFamily: 'Roboto', sans-serif;
        }
    }
});

function LoginComponent() {
    const {
        initializing,
        login,
        loadings: { loading_login }
    } = useExpenses();
    return (
        <LoadingComponent loading={initializing || loading_login} fullScreen>
            <Column
                horizontal="center"
                vertical="center"
                className={css(styles.container)}
            >
                <Column
                    horizontal="center"
                    flexGrow={1}
                    className={css(styles.loginBox)}
                >
                    <span className={css(styles.loginTitle)}>Login</span>
                    <Column
                        flexGrow={1}
                        style={{ width: '100%', marginTop: -40 }}
                        vertical="center"
                        horizontal="center"
                    >
                        <Row
                            vertical="center"
                            className={css(styles.googleLoginButton)}
                            onClick={() => login()}
                        >
                            <img
                                src={GoogleButton}
                                height={42}
                                width={42}
                                alt="google_button"
                            />
                            <Row
                                flexGrow={1}
                                horizontal="center"
                                vertical="center"
                            >
                                <span>Google</span>
                            </Row>
                        </Row>
                    </Column>
                </Column>
            </Column>
        </LoadingComponent>
    );
}

LoginComponent.whyDidYouRender = false;

export default LoginComponent;
