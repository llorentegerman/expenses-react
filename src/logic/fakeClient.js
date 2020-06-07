import fakeData from './fakeData.json';

const timeout = async ms => new Promise(res => setTimeout(res, ms));

const _objectToArray = object => {
    const keys = Object.keys(object);
    const result = [];
    for (let i = 0; i < keys.length; i++) {
        const id = keys[i];
        result.push(object[id]);
    }
    return result;
};

const addSheet = async ({ user, name }) => {};

const getExpenses = async ({ sheetId }) => {
    const expenses = fakeData.sheets['ABC'].expenses;
    const result = _objectToArray(expenses);
    result.sort((a, b) => a.dateNeg - b.dateNeg);
    return result;
};

const getExpenseById = async ({ sheetId, expenseId }) => {
    if (!expenseId) {
        return null;
    }
    return fakeData.sheets['ABC'].expenses[expenseId];
};

const getExpensesRef = ({ sheetId }) => getRef(`/sheets/${sheetId}/expenses`);

const getFile = async filePath => '';

const getMetadata = async ({ sheetId }) => {
    await timeout(500);
    return fakeData.sheets['ABC'].metadata;
};

const getMetadataRef = ({ sheetId }) => getRef(`/sheets/${sheetId}/metadata`);

const getNewExpenseId = ({ sheetId }) => {};

const getNewSheetId = () => {};

const getRef = path => ({
    on: (value, cb) => {
        cb({
            val: () => true
        });
    },
    off: () => {}
});

const getSheet = async ({ sheetId }) => {
    const sheet = fakeData.sheets['ABC'];
    const expenses = await getExpenses({ sheetId });
    return {
        sheetId: 'ABC',
        sheetName: sheet.name,
        expenses,
        metadata: sheet.metadata
    };
};

const getSheetName = ({ sheetId }) => 'Australia';

const init = () => {
    return {
        googleProvider: {}
    };
};

const login = async ({ googleProvider }) => {};

const logout = () => {};

const onAuthStateChanged = ({ callback }) => {
    callback({
        uid: 'user1'
    });
    return () => {};
};

const refreshUser = async userUID => {
    return {
        user: {
            email: 'llorentegerman@gmail.com',
            familyName: 'Llorente',
            givenName: 'German',
            id: 'user1',
            name: 'German Llorente',
            photoUrl:
                'https://media-exp1.licdn.com/dms/image/C5603AQHvxXcHBt5etA/profile-displayphoto-shrink_400_400/0?e=1594857600&v=beta&t=plBhadPkk_suuuOfrYm8mOLsNEi3ovsx731L_XaeqjE',
            sheets: {
                ABC: {
                    id: 'ABC',
                    metadata: { position: 0, show: true },
                    name: 'Australia'
                }
            },
            uid: 'user1'
        }
    };
};

const removeExpense = ({ sheetId, expenseId }) => {};

const removeSheet = async ({ sheetId, userId }) => {};

const setMetadata = ({ sheetId, type, items }) => {};

const setSheetName = async ({ sheetId, userId, sheetName }) => {};

const setUserSheets = ({ userId, sheets }) => {};

const updateObject = ({ object }) => {};

const upsertExpense = async ({
    sheetId,
    item: { files = [], ...item },
    metadata
}) => {};

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
