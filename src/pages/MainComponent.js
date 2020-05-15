import React, { useEffect } from 'react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import { Route, Switch } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import { useExpenses } from '../logic/useExpenses';
import SidebarComponent from '../commons/sidebar/SidebarComponent';
import HeaderComponent from '../commons/header/HeaderComponent';
import InitializingComponent from '../commons/InitializingComponent';
import NotificationComponent from '../commons/NotificationComponent';
import LoginComponent from './auth/LoginComponent';
import Routes from './routes';

const styles = StyleSheet.create({
    container: {
        height: '100%',
        minHeight: 850
    },
    content: {
        marginTop: 54,
        '@media (max-width: 1080px)': {
            padding: 34
        }
    },
    mainBlock: {
        backgroundColor: '#F7F8FC',
        padding: 30,
        marginLeft: 255,
        '@media (max-width: 1080px)': {
            marginLeft: 0,
            padding: 10
        }
    }
});

function MainComponent() {
    return (
        <Row className={css(styles.container)}>
            <SidebarComponent />
            <Column flexGrow={1} className={css(styles.mainBlock)}>
                <HeaderComponent />
                <Routes />
            </Column>
        </Row>
    );
}

function RenterRoutes() {
    const { initializing, isOnline, user } = useExpenses();
    const { history, location } = useReactRouter();

    useEffect(() => {
        if (!initializing) {
            if (history && location.pathname !== '/login' && !user) {
                history.push('/login');
            } else if (user && location.pathname === '/login') {
                history.push('/');
            }
        }
    }, [history, location, user, initializing]);

    useEffect(() => {
        if (!initializing) {
            if (!isOnline) {
                NotificationComponent.show({
                    key: 'offline',
                    message: 'You are offline',
                    style: {
                        backgroundColor: 'red',
                        color: '#FFFFFF'
                    }
                });
            } else {
                NotificationComponent.hide('offline');
            }
        }
    }, [initializing, isOnline]);

    useEffect(() => {
        if (!initializing) {
            if (process.env.REACT_APP_fakeClient === 'true') {
                NotificationComponent.show({
                    key: 'fake',
                    message: (
                        <span>
                            <b>Fake data</b>
                            <span
                                style={{ cursor: 'pointer', marginLeft: 16 }}
                                onClick={() =>
                                    NotificationComponent.hide('fake')
                                }
                            >
                                &#10005;
                            </span>
                        </span>
                    ),
                    style: {
                        backgroundColor: 'rgb(44, 104, 156)',
                        color: 'rgb(164, 166, 179)'
                    }
                });
            } else {
                NotificationComponent.hide('fake');
            }
        }
    }, [initializing]);

    if (initializing) {
        return <InitializingComponent />;
    }

    return (
        <Switch>
            <Route exact path={`/login`} component={LoginComponent} />
            <Route path={`/`} component={MainComponent} />
        </Switch>
    );
}

export default RenterRoutes;
