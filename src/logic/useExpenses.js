import React, { useState, useContext, createContext } from 'react';
import useFirebase from './useFirebase';

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

function useProvideExpenses() {
    const {
        firebase,
        getExpenses,
        getExpenseById,
        getMetadata,
        getNewExpenseId,
        getSheetName,
        googleProvider,
        initializing,
        isOnline,
        refreshUser,
        removeExpense: _removeExpense,
        setUser,
        user
    } = useFirebase();

    const [loading_getSheet, setloading_getSheet] = useState(false);
    const [loading_upsertExpense, setloading_upsertExpense] = useState(false);
    const [loading_removeExpense, setloading_removeExpense] = useState(false);
    const [loading_addSheet, setloading_addSheet] = useState(false);
    const [loading_removeSheet, setloading_removeSheet] = useState(false);
    const [loading_login, setloading_login] = useState(false);
    const [loading_logout, setloading_logout] = useState(false);
    const [loading_setSection, setloading_setSection] = useState(false);
    const [loading_setSheetName, setloading_setSheetName] = useState(false);
    const [loading_setUserSheets, setloading_setUserSheets] = useState(false);

    const getSheet = async sheetId => {
        try {
            setloading_getSheet(true);

            // Promises
            const getExpensesPromise = getExpenses({ sheetId });
            const getMetadataPromise = getMetadata({ sheetId });
            const getSheetNamePromise = getSheetName({ sheetId });

            // Resolves
            const expenses = await getExpensesPromise;
            const metadata = await getMetadataPromise;
            const sheetName = await getSheetNamePromise;

            setloading_getSheet(false);

            return {
                sheetId,
                sheetName,
                expenses,
                metadata
            };
        } catch (ex) {
            setloading_getSheet(false);
            console.log('Error refreshExpenses', ex.message);
            alert('Error Refresh Expenses');
        }
    };

    const getSheet2 = async ({ sheetId }) => {
        // Promises
        const getExpensesPromise = getExpenses({ sheetId });
        const getMetadataPromise = getMetadata({ sheetId });
        const getSheetNamePromise = getSheetName({ sheetId });

        // Resolves
        const expenses = await getExpensesPromise;
        const metadata = await getMetadataPromise;
        const sheetName = await getSheetNamePromise;

        return {
            sheetId,
            sheetName,
            expenses,
            metadata
        };
    };

    const upsertExpense = async ({
        sheetId,
        item: { files = [], ...item },
        metadata
    }) => {
        setloading_upsertExpense(true);
        try {
            const newId = item.id || getNewExpenseId({ sheetId });
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

    const removeExpense = async (sheetId, expenseId) => {
        try {
            setloading_removeExpense(true);
            await _removeExpense({ sheetId, expenseId });

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

    const setSheetName = async ({ sheetId, name }) => {
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

    const setUserSheets = async sheets => {
        setloading_setUserSheets(true);
        try {
            await firebase
                .database()
                .ref(`users/${user.uid}/sheets`)
                .set(sheets);
            const refreshResponse = await refreshUser(user.uid);
            setUser(refreshResponse.user);
        } catch (ex) {
            console.log('Error setSheetName', ex.message);
            alert('Error Set Sheet Name');
        } finally {
            setloading_setUserSheets(false);
        }
    };

    const setMetadata = async ({ sheetId, type, items }) => {
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
        getSheet2,
        getSheetName,
        getMetadata,
        getExpenseById,

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

        isOnline,

        setUserSheets,

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
            loading_setUserSheets,
        loadings: {
            loading_upsertExpense,
            removeExpense: loading_removeExpense,
            addSheet: loading_addSheet,
            removeSheet: loading_removeSheet,
            login: loading_login,
            logout: loading_logout,
            setCategories: loading_setSection,
            setSheetName: loading_setSheetName,
            setUserSheets: loading_setUserSheets,
            loading_getSheet
        }
    };
}
