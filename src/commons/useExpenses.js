import React, { useState, useEffect, useContext, createContext } from 'react';
import firebase from 'firebase';

const expensesContext = createContext();

export function ProvideExpenses({ children }) {
    const expenses = useProvideExpenses();
    return (
        <expensesContext.Provider value={expenses}>
            {children}
        </expensesContext.Provider>
    );
}

export const useExpenses = () => {
    return useContext(expensesContext);
};

const config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId
};
firebase.initializeApp(config);

const googleProvider = new firebase.auth.GoogleAuthProvider();

const formatData = data => {
    const array = [...data];
    array.sort(function(a, b) {
        a = a.date;
        b = b.date;
        return a > b ? -1 : a < b ? 1 : 0;
    });
    return array;
};

function useProvideExpenses() {
    const [initializing, setInitializing] = useState(true);

    const [loading_getSheet, setloading_getSheet] = useState(false);
    const [loading_getExpenseById, setloading_getExpenseById] = useState(false);
    const [loading_upsertExpense, setloading_upsertExpense] = useState(false);
    const [loading_removeExpense, setloading_removeExpense] = useState(false);
    const [loading_addSheet, setloading_addSheet] = useState(false);
    const [loading_removeSheet, setloading_removeSheet] = useState(false);
    const [loading_login, setloading_login] = useState(false);
    const [loading_logout, setloading_logout] = useState(false);
    const [loading_setSection, setloading_setSection] = useState(false);
    const [loading_setSheetName, setloading_setSheetName] = useState(false);

    const [user, setUser] = useState(null);
    const [isOnline, setIsOnline] = useState(true);

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

    // useEffect(() => {
    //     let newUser = null;
    //     refreshUser('QjRiOvbUTpZFFaWLgM48UF5YPBG3').then(
    //         async refreshResponse => {
    //             newUser = refreshResponse.user;
    //             setUser(newUser);
    //             setInitializing(false);
    //         }
    //     );
    // }, []);

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
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', function(snap) {
            if (snap.val() === true) {
                setIsOnline(true);
            } else {
                setIsOnline(false);
            }
        });
        return () => {
            listener();
        };
    }, []);

    const getSheet = async sheetId => {
        try {
            setloading_getSheet(true);

            const sheetRef = firebase.database().ref(`/sheets/${sheetId}`);

            const snapshotSheetPromise = sheetRef.once('value');

            const snapshotSheet = await snapshotSheetPromise;

            const sheetValue = snapshotSheet.val();
            const array = Object.keys(sheetValue.expenses || {}).map(
                id => sheetValue.expenses[id]
            );
            const expenses = formatData(array);

            setloading_getSheet(false);
            return {
                ...sheetValue,
                expenses,
                expensesRaw: array
            };
        } catch (ex) {
            setloading_getSheet(false);
            console.log('Error refreshExpenses', ex.message);
            alert('Error Refresh Expenses');
        }
    };

    const getExpenseById = async (sheetId, expenseId) => {
        try {
            setloading_getExpenseById(true);

            const expensesRef = firebase
                .database()
                .ref(`/sheets/${sheetId}/expenses/${expenseId}`);

            const snapshotExpensesPromise = expensesRef
                .orderByChild('date')
                .once('value');

            const snapshotExpenses = await snapshotExpensesPromise;

            const expensesValue = snapshotExpenses.val();
            const array = Object.keys(expensesValue || {}).map(
                id => expensesValue[id]
            );
            const expenses = formatData(array);

            setloading_getExpenseById(false);
            return {
                expenses
            };
        } catch (ex) {
            setloading_getExpenseById(false);
            console.log('Error getExpenseById', ex.message);
            alert('Error Refresh Expenses');
        }
    };

    const getExpensesRef = sheetId =>
        firebase.database().ref(`/sheets/${sheetId}/expenses`);

    const getMetadataRef = sheetId =>
        firebase.database().ref(`/sheets/${sheetId}/metadata`);

    const upsertExpense = async (
        sheetId,
        { files = [], ...item },
        metadata
    ) => {
        setloading_upsertExpense(true);
        try {
            const newId =
                item.id ||
                firebase
                    .database()
                    .ref()
                    .child(`sheets/${sheetId}`)
                    .push().key;
            const newExpense = { id: newId, files: [], ...item };
            let tags = (newExpense.tags || '').split(',');
            tags = tags.map(t => t.trim()).filter(t => !!t);
            newExpense.tags = tags.join(',');
            const updates = {};
            updates[`sheets/${sheetId}/expenses/${newId}`] = newExpense;

            if (!metadata.categories[newExpense.category]) {
                updates[
                    `sheets/${sheetId}/metadata/categories/${newExpense.category}`
                ] = {
                    position: 100
                };
            }

            if (!metadata.currencies[newExpense.currency]) {
                updates[
                    `sheets/${sheetId}/metadata/currencies/${newExpense.currency}`
                ] = {
                    position: 100
                };
            }

            if (!metadata.methods[newExpense.method]) {
                updates[
                    `sheets/${sheetId}/metadata/methods/${newExpense.method}`
                ] = {
                    position: 100
                };
            }

            if (!metadata.cities[newExpense.city]) {
                updates[
                    `sheets/${sheetId}/metadata/cities/${newExpense.city}`
                ] = {
                    position: 100
                };
            }

            tags.forEach(tag => {
                tag = tag.trim();
                if (tag && !metadata.tags[tag]) {
                    updates[`sheets/${sheetId}/metadata/tags/${tag}`] = {
                        position: 100
                    };
                }
            });

            // Create a root reference
            var storageRef = firebase.storage().ref();
            for (let i = 0; i < files.length; i++) {
                if (files[i].url) {
                    newExpense.files.push({
                        url: files[i].url,
                        name: files[i].name || ''
                    });
                    if (files[i].rotate) {
                        await rotateImage(files[i].url, files[i].rotate);
                    }
                    continue;
                }
                const extension = files[i].name.split('.').pop();
                const filePath = `${sheetId}/${newId}/${new Date().getTime()}.${extension}`;
                try {
                    var fileRef = storageRef.child(filePath);
                    await fileRef.put(files[i]);
                    newExpense.files.push({
                        url: filePath,
                        name: files[i].name
                    });
                } catch (e) {
                    console.log('error', e.message);
                }
            }

            await firebase
                .database()
                .ref()
                .update(updates);
            setloading_upsertExpense(false);
        } catch (ex) {
            setloading_upsertExpense(false);
            console.log('Error upsertExpense', ex.message);
            alert('Error Add Expense');
        }
    };

    const getFile = async filePath => {
        // Create a reference with an initial file path and name
        try {
            var storage = firebase.storage();
            var pathReference = storage.ref(filePath);
            const url = await pathReference.getDownloadURL();
            return url;
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    };

    const removeExpense = async (sheetId, id) => {
        try {
            setloading_removeExpense(true);
            await firebase
                .database()
                .ref()
                .child(`sheets/${sheetId}/expenses/${id}`)
                .remove();

            setloading_removeExpense(false);
        } catch (ex) {
            setloading_removeExpense(false);
            console.log('Error removeExpense', ex.message);
            alert('Error Remove Expense');
        }
    };

    const addSheet = async name => {
        try {
            setloading_addSheet(true);
            const newSheetId = firebase
                .database()
                .ref()
                .child('sheets')
                .push().key;
            const newSheet = {};
            newSheet[`sheets/${newSheetId}`] = {
                id: newSheetId,
                name: name || `sheet_${newSheetId}`,
                expenses: '',
                metadata: {
                    categories: '',
                    currencies: '',
                    methods: '',
                    expenses: '',
                    tags: '',
                    cities: '',
                    statistics: '',
                    features: {
                        images: true
                    }
                }
            };
            await firebase
                .database()
                .ref()
                .update(newSheet);

            const newAuth = {};
            newAuth[`authorization/${newSheetId}/${user.uid}`] = {
                role: 'admin'
            };
            await firebase
                .database()
                .ref()
                .update(newAuth);

            const newUserSheet = {};
            newUserSheet[`users/${user.uid}/sheets/${newSheetId}`] = {
                id: newSheetId,
                name: name || `sheet_${newSheetId}`
            };
            await firebase
                .database()
                .ref()
                .update(newUserSheet);

            const userUpdate = { ...user };
            userUpdate.sheets[newSheetId] = {
                id: newSheetId,
                name: name || `sheet_${newSheetId}`
            };

            setUser(userUpdate);

            setloading_addSheet(false);

            return newSheetId;
        } catch (ex) {
            setloading_addSheet(false);
            console.log('Error Add Sheet', ex.message);
            alert('Error Add Sheet');
        }
    };

    const updateSheet = async (sheetId, name) => {
        try {
            setloading_addSheet(true);
            const snapshot = await firebase
                .database()
                .ref(`/sheets/${sheetId}`)
                .once('value');
            const sheetToEdit = snapshot.val();

            const newSheet = {};
            newSheet[`sheets/${sheetId}`] = {
                ...sheetToEdit,
                name: name || `sheet_${sheetId}`
            };
            await firebase
                .database()
                .ref()
                .update(newSheet);

            const userUpdate = { ...user };
            userUpdate.sheets[sheetId] = {
                id: sheetId,
                name: name || `sheet_${sheetId}`
            };

            const newUserSheet = {};
            newUserSheet[`users/${user.uid}/sheets/${sheetId}`] =
                userUpdate.sheets[sheetId];
            await firebase
                .database()
                .ref()
                .update(newUserSheet);

            setUser(userUpdate);
            setloading_addSheet(false);
        } catch (ex) {
            setloading_addSheet(false);
            console.log('Error Add Sheet', ex.message);
            alert('Error Add Sheet');
        }
    };

    const removeSheet = async id => {
        try {
            setloading_removeSheet(true);
            await firebase
                .database()
                .ref()
                .child(`sheets/${id}`)
                .remove();
            await firebase
                .database()
                .ref()
                .child(`users/${user.uid}/sheets/${id}`)
                .remove();
            await firebase
                .database()
                .ref()
                .child(`authorization/${id}`)
                .remove();

            const userUpdate = { ...user };
            delete userUpdate.sheets[id];
            setUser(userUpdate);

            setloading_removeSheet(false);
        } catch (ex) {
            setloading_removeSheet(false);
            console.log('Error removeSheet', ex.message);
            alert('Error Remove Sheet');
        }
    };

    const setSheetName = async (sheetId, name) => {
        setloading_setSheetName(true);
        try {
            await firebase
                .database()
                .ref(`sheets/${sheetId}/name`)
                .set(name);
            await firebase
                .database()
                .ref(`users/${user.uid}/sheets/${sheetId}/name`)
                .set(name);
            const refreshResponse = await refreshUser(user.uid);
            setUser(refreshResponse.user);
        } catch (ex) {
            console.log('Error setSheetName', ex.message);
            alert('Error Set Sheet Name');
        } finally {
            setloading_setSheetName(false);
        }
    };

    const setMetadata = async (sheetId, type, items) => {
        setloading_setSection(true);
        try {
            await firebase
                .database()
                .ref(`sheets/${sheetId}/metadata/${type}`)
                .set(items);
            setloading_setSection(false);
        } catch (ex) {
            setloading_setSection(false);
            console.log('Error setMetadata', ex.message);
            alert('Error Set Metadata');
        }
    };

    const isFeatureEnabled = (metadata, feature) =>
        metadata && metadata.features && metadata.features[feature];

    const login = async () => {
        const authenticationResult = await firebase
            .auth()
            .signInWithPopup(googleProvider);
        setloading_login(true);
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
        setloading_login(false);
    };

    const logout = async () => {
        setloading_logout(true);
        await firebase.auth().signOut();
        setloading_logout(false);
    };

    const rotateImage = async (path, angle) => {
        const addMessage = firebase.functions().httpsCallable('rotateImage');
        return addMessage({ path, angle });
    };

    return {
        getSheet,
        getExpenseById,
        formatData,
        getExpensesRef,
        getMetadataRef,

        upsertExpense,
        removeExpense,

        addSheet,
        updateSheet,
        removeSheet,
        setSheetName,

        initializing,
        user,
        login,
        logout,

        setMetadata,

        getFile,

        isFeatureEnabled,
        isOnline,

        loading:
            loading_upsertExpense ||
            loading_removeExpense ||
            loading_addSheet ||
            loading_removeSheet ||
            loading_login ||
            loading_logout ||
            loading_setSection ||
            loading_setSheetName ||
            loading_getSheet ||
            loading_getExpenseById,
        loadings: {
            loading_upsertExpense,
            removeExpense: loading_removeExpense,
            addSheet: loading_addSheet,
            removeSheet: loading_removeSheet,
            login: loading_login,
            logout: loading_logout,
            setCategories: loading_setSection,
            setSheetName: loading_setSheetName,
            loading_getSheet,
            loading_getExpenseById
        }
    };
}
