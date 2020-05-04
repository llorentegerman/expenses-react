import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';
import 'firebase/functions';

const _fetchData = async path => {
    const reference = getRef(path);
    const snapshot = await reference.once('value');
    const value = snapshot.val();
    return value;
};

const _rotateImage = async (path, angle) => {
    const addMessage = firebase.functions().httpsCallable('rotateImage');
    return addMessage({ path, angle });
};

const _config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId
};

const addSheet = async ({ user, name }) => {
    const newSheetId = getNewSheetId();
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
            show: true
        }
    };
    await updateObject({ object: newSheet });

    const newAuth = {};
    newAuth[`authorization/${newSheetId}/${user.uid}`] = {
        role: 'admin'
    };
    await updateObject({ object: newAuth });

    const newUserSheet = {};
    newUserSheet[`users/${user.uid}/sheets/${newSheetId}`] = {
        id: newSheetId,
        name: name || `sheet_${newSheetId}`,
        metadata: {
            position: 100,
            show: true
        }
    };
    await updateObject({ object: newUserSheet });

    const userUpdate = { ...user };
    userUpdate.sheets[newSheetId] = {
        id: newSheetId,
        name: name || `sheet_${newSheetId}`
    };

    return newSheetId;
};

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
    _fetchData(`/sheets/${sheetId}/expenses/${expenseId}`);

const getExpensesRef = ({ sheetId }) => getRef(`/sheets/${sheetId}/expenses`);

const getFile = async filePath => {
    const storage = firebase.storage();
    const pathReference = storage.ref(filePath);
    const url = await pathReference.getDownloadURL();
    return url;
};

const getMetadata = async ({ sheetId }) =>
    _fetchData(`/sheets/${sheetId}/metadata`);

const getMetadataRef = ({ sheetId }) => getRef(`/sheets/${sheetId}/metadata`);

const getNewExpenseId = ({ sheetId }) =>
    getRef()
        .child(`sheets/${sheetId}`)
        .push().key;

const getNewSheetId = () =>
    getRef()
        .child('sheets')
        .push().key;

const getRef = path => firebase.database().ref(path);

const getSheet = async ({ sheetId }) => {
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

const getSheetName = ({ sheetId }) => _fetchData(`/sheets/${sheetId}/name`);

const init = () => {
    firebase.initializeApp(_config);
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    return {
        googleProvider
    };
};

const login = async ({ googleProvider }) => {
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

            await updateObject({ object: updates });
        } catch (ex) {}
    }
};

const logout = () => firebase.auth().signOut();

const onAuthStateChanged = ({ callback }) =>
    firebase.auth().onAuthStateChanged(callback);

const refreshUser = async userUID => {
    const user = await _fetchData(`/users/${userUID}`);
    user.uid = userUID;

    return {
        user
    };
};

const removeExpense = ({ sheetId, expenseId }) =>
    getRef()
        .child(`sheets/${sheetId}/expenses/${expenseId}`)
        .remove();

const removeSheet = async ({ sheetId, userId }) => {
    await firebase
        .database()
        .ref()
        .child(`sheets/${sheetId}`)
        .remove();
    await firebase
        .database()
        .ref()
        .child(`users/${userId}/sheets/${sheetId}`)
        .remove();
    await firebase
        .database()
        .ref()
        .child(`authorization/${sheetId}`)
        .remove();
};

const setMetadata = ({ sheetId, type, items }) =>
    getRef(`sheets/${sheetId}/metadata/${type}`).set(items);

const setSheetName = async ({ sheetId, userId, sheetName }) => {
    await firebase
        .database()
        .ref(`sheets/${sheetId}/name`)
        .set(sheetName);
    await firebase
        .database()
        .ref(`users/${userId}/sheets/${sheetId}/name`)
        .set(sheetName);
};

const setUserSheets = ({ userId, sheets }) =>
    getRef(`users/${userId}/sheets`).set(sheets);

const updateObject = ({ object }) =>
    firebase
        .database()
        .ref()
        .update(object);

const upsertExpense = async ({
    sheetId,
    item: { files = [], ...item },
    metadata
}) => {
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
        updates[`sheets/${sheetId}/metadata/methods/${newExpense.method}`] = {
            position: 100
        };
    }

    if (!metadata.cities[newExpense.city]) {
        updates[`sheets/${sheetId}/metadata/cities/${newExpense.city}`] = {
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
                await _rotateImage(files[i].url, files[i].rotate);
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
};

export default {
    addSheet,
    getExpenses,
    getExpenseById,
    getExpensesRef,
    getFile,
    getMetadata,
    getMetadataRef,
    getNewExpenseId,
    getNewSheetId,
    getRef,
    getSheet,
    getSheetName,
    init,
    login,
    logout,
    onAuthStateChanged,
    refreshUser,
    removeExpense,
    removeSheet,
    setMetadata,
    setSheetName,
    setUserSheets,
    updateObject,
    upsertExpense
};
