import { useEffect, useState } from 'react';
import firebase from 'firebase';
import firebaseClient from './firebaseClient';

const config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId
};

let initialized = false;
let googleProvider;

const init = () => {
    if (initialized) return { firebase, googleProvider };
    firebase.initializeApp(config);
    googleProvider = new firebase.auth.GoogleAuthProvider();
    initialized = true;
    return {
        firebase,
        googleProvider
    };
};

export default () => {
    const [isOnline, setIsOnline] = useState(true);
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        init();
        const connectedRef = firebaseClient.getRef('.info/connected');
        connectedRef.on('value', snap => {
            if (snap.val() === true) {
                setIsOnline(true);
            } else {
                setIsOnline(false);
            }
        });
    }, []);

    useEffect(() => {
        const listener = firebase
            .auth()
            .onAuthStateChanged(async loggedUser => {
                let newUser = null;
                if (loggedUser) {
                    const refreshResponse = await firebaseClient.refreshUser(
                        loggedUser.uid
                    );
                    newUser = refreshResponse.user;
                }
                setUser(newUser);
                setInitializing(false);
            });
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
    };

    const login = async () => {
        const authenticationResult = await firebase
            .auth()
            .signInWithPopup(googleProvider);
        if (
            authenticationResult.additionalUserInfo &&
            authenticationResult.additionalUserInfo.isNewUser
        ) {
            try {
                const {
                    displayName,
                    email,
                    photoURL,
                    uid
                } = authenticationResult.user;
                const updates = {};
                updates[`users/${authenticationResult.user.uid}`] = {
                    displayName,
                    email,
                    photoURL,
                    uid,
                    sheets: ''
                };

                await firebase
                    .database()
                    .ref()
                    .update(updates);
            } catch (ex) {}
        }
    };

    const logout = () => firebase.auth().signOut();

    return {
        firebase,
        googleProvider,
        initializing,
        isOnline,
        login,
        logout,
        refreshUser,
        user
    };
};
