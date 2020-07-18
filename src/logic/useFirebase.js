import { useEffect, useRef, useState } from 'react';
import firebaseClient from './firebaseClient';

export default () => {
    const [isOnline, setIsOnline] = useState(true);
    const [user, setUser] = useState(null);
    const [googleProvider, setGoogleProvider] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const isOnlineRef = useRef(null);

    useEffect(() => {
        const { googleProvider } = firebaseClient.init();
        setGoogleProvider(googleProvider);
        const connectedRef = firebaseClient.getRef('.info/connected');
        connectedRef.on('value', snap => {
            if (snap.val() === true) {
                setIsOnline(true);
                isOnlineRef.current = true;
                localStorage.setItem('isOnline', 'true');
            } else {
                setIsOnline(false);
                isOnlineRef.current = false;
                localStorage.setItem('isOnline', 'false');
                setTimeout(() => {
                    if (!isOnlineRef.current) {
                        const lsUser = localStorage.getItem('user');
                        if (lsUser) {
                            setUser(JSON.parse(lsUser));
                        }
                        setInitializing(false);
                    }
                }, 3000);
            }
        });
    }, []);

    useEffect(() => {
        const callback = async loggedUser => {
            let newUser = null;
            if (loggedUser) {
                const refreshResponse = await firebaseClient.refreshUser(
                    loggedUser.uid
                );
                newUser = refreshResponse.user;
            }
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            setInitializing(false);
        };
        const listener = firebaseClient.onAuthStateChanged({ callback });
        return () => {
            listener();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setInitializing]);

    const refreshUser = async () => {
        if (!user) {
            return;
        }
        const refreshResponse = await firebaseClient.refreshUser(user.uid);
        setUser(refreshResponse.user);
        localStorage.setItem('user', JSON.stringify(refreshResponse.user));
    };

    const login = async () =>
        firebaseClient.login({
            googleProvider
        });

    return {
        googleProvider,
        initializing,
        isOnline,
        login,
        logout: firebaseClient.logout,
        refreshUser,
        user
    };
};
