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

    const getRef = path => firebase.database().ref(path);

    const fetchData = async path => {
        const reference = getRef(path);
        const snapshot = await reference.once('value');
        const value = snapshot.val();
        return value;
    };

    useEffect(() => {
        init();
        const connectedRef = getRef('.info/connected');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setInitializing]);

    const refreshUser = async userUID => {
        const user = await fetchData(`/users/${userUID}`);
        user.uid = userUID;

        return {
            user
        };
    };

    const getExpensesRef = ({ sheetId }) =>
        getRef(`/sheets/${sheetId}/expenses`);

    const getMetadataRef = ({ sheetId }) =>
        getRef(`/sheets/${sheetId}/metadata`);

    const getSheetName = ({ sheetId }) => fetchData(`/sheets/${sheetId}/name`);

    const getExpenses = async ({ sheetId }) => {
        const expenses = [];
        const expensesRef = getExpensesRef({ sheetId });
        const snapshotExpenses = await expensesRef
            .orderByChild('dateNeg')
            .once('value');
        snapshotExpenses.forEach(child => {
            expenses.push(child.val());
        });
        return expenses;
    };

    const getExpenseById = ({ sheetId, expenseId }) =>
        fetchData(`/sheets/${sheetId}/expenses/${expenseId}`);

    const getMetadata = async ({ sheetId }) =>
        fetchData(`/sheets/${sheetId}/metadata`);

    const getNewExpenseId = ({ sheetId }) =>
        getRef()
            .child(`sheets/${sheetId}`)
            .push().key;

    const removeExpense = ({ sheetId, expenseId }) =>
        getRef()
            .child(`sheets/${sheetId}/expenses/${expenseId}`)
            .remove();

    return {
        firebase,
        getExpenses,
        getExpenseById,
        getExpensesRef,
        getMetadata,
        getMetadataRef,
        getNewExpenseId,
        getSheetName,
        googleProvider,
        initializing,
        isOnline,
        refreshUser,
        removeExpense,
        setUser,
        user
    };
};
