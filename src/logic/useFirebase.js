import { useEffect, useState } from 'react';
import firebase from 'firebase';

const config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId
};

export const init = () => {
    firebase.initializeApp(config);
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    return {
        firebase,
        googleProvider
    };
};

export const useFirebase = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const connectedRef = firebase.database().ref('.info/connected');
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
                    const refreshResponse = await refreshUser(loggedUser.uid);
                    newUser = refreshResponse.user;
                }
                setUser(newUser);
                setInitializing(false);
            });
        return () => {
            listener();
        };
    }, [setInitializing]);

    const refreshUser = async userUID => {
        const user = (
            await firebase
                .database()
                .ref(`/users/${userUID}`)
                .once('value')
        ).val();
        user.uid = userUID;

        return {
            user
        };
    };

    const getExpensesRef = sheetId =>
        firebase.database().ref(`/sheets/${sheetId}/expenses`);

    const getMetadataRef = sheetId =>
        firebase.database().ref(`/sheets/${sheetId}/metadata`);

    return {
        getExpensesRef,
        getMetadataRef,
        initializing,
        isOnline,
        refreshUser,
        setUser,
        user
    };
};
