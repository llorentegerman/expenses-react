const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const { resizeImage } = require('./src/resizeImage');
const { rotateImage } = require('./src/rotateImage');

admin.initializeApp();

exports.updateStatics = functions.database
    .ref('/sheets/{sheetId}/expenses/{expenseId}')
    .onWrite(async (snapshot, context) => {
        const { sheetId, expenseId } = context.params;
        console.log('sheetId', sheetId, 'expenseId', expenseId);
        const snapshotDB = await admin
            .database()
            .ref(`/sheets/${context.params.sheetId}`)
            .once('value');
        const sheetObject = snapshotDB.val();
        const array = Object.keys(sheetObject.expenses || {}).map(
            id => sheetObject.expenses[id]
        );

        const snapshotStatistics = await admin
            .database()
            .ref(`/sheets/${context.params.sheetId}/metadata/statistics`)
            .once('value');
        const statistics = snapshotStatistics.val() || {};

        let minDate;
        let minPeriod;
        let total = 0;
        const periods = {};
        const categories = {};
        array.forEach(i => {
            if (i.tags && i.tags.indexOf('noavg') >= 0) {
                return;
            }
            total += Number(i.amount);
            const period = moment(Number(i.date))
                .utcOffset(-3)
                .format('YYYY-MM');
            if (!minDate || Number(i.date) < minDate) {
                minDate = Number(i.date);
                minPeriod = period;
            }
            if (!periods[period]) {
                periods[period] = {
                    total: 0,
                    average: 0,
                    categories: {}
                };
            }
            if (!periods[period].categories[i.category]) {
                periods[period].categories[i.category] = {
                    total: 0,
                    average: 0
                };
            }
            if (!categories[i.category]) {
                categories[i.category] = {
                    total: 0,
                    average: 0
                };
            }

            periods[period].total += Number(i.amount);
            categories[i.category].total += Number(i.amount);
            periods[period].categories[i.category].total += Number(i.amount);
        });

        Object.keys(periods).forEach(p => {
            let periodDays =
                moment()
                    .utcOffset(-3)
                    .startOf('day')
                    .diff(
                        (p === minPeriod
                            ? moment(minDate).utcOffset(-3)
                            : moment(`${p}-01`, 'YYYY-MM-DD')
                        ).startOf('day'),
                        'days'
                    ) + 1;
            if (
                moment()
                    .utcOffset(-3)
                    .startOf('day')
                    .isSameOrAfter(
                        moment(`${p}-01`, 'YYYY-MM-DD')
                            .endOf('month')
                            .startOf('day')
                    )
            ) {
                periodDays =
                    moment(`${p}-01`, 'YYYY-MM-DD')
                        .endOf('month')
                        .startOf('day')
                        .diff(
                            (p === minPeriod
                                ? moment(minDate).utcOffset(-3)
                                : moment(`${p}-01`, 'YYYY-MM-DD')
                            ).startOf('day'),
                            'days'
                        ) + 1;
            }
            periods[p].average = periods[p].total / periodDays;
            Object.keys(periods[p].categories).forEach(c => {
                periods[p].categories[c].average =
                    periods[p].categories[c].total / periodDays;
            });
            periods[p].days = periodDays;
            periods[p].lastUpdate = new Date().getTime();
        });

        const totalDays =
            moment()
                .utcOffset(-3)
                .startOf('day')
                .diff(
                    moment(minDate)
                        .utcOffset(-3)
                        .startOf('day'),
                    'days'
                ) + 1;

        Object.keys(categories).forEach(c => {
            categories[c].average = categories[c].total / totalDays;
        });

        const updateItem = {
            ...statistics,
            categories,
            minDate,
            total,
            average: total / totalDays,
            lastUpdate: new Date().getTime(),
            createdAt: statistics.createdAt || new Date().getTime()
        };

        Object.keys(periods).forEach(p => {
            updateItem[p] = periods[p];
        });

        await admin
            .database()
            .ref(`/sheets/${context.params.sheetId}/metadata/statistics`)
            .set(updateItem);
    });

/*
exports.newStructure = functions.database
    .ref('/sheets/{sheetId}/expenses/{expenseId}')
    .onWrite(async (snapshot, context) => {
        const snapshotDB = await admin
            .database()
            .ref(`/sheets/${context.params.sheetId}`)
            .once('value');
        const sheetObject = snapshotDB.val();

        const metadata = {
            categories: sheetObject.categories,
            cities: sheetObject.cities,
            currencies: sheetObject.currencies,
            methods: sheetObject.methods,
            statistics: sheetObject.statistics,
            tags: sheetObject.categories,
            name: sheetObject.name
        };

        const updateItem = {
            ...sheetObject,
            metadata
        };

        await admin
            .database()
            .ref(`/sheets/${context.params.sheetId}`)
            .set(updateItem);
    });


exports.updateStatics = functions.database.ref('/sheets/{sheetId}/expenses/{expenseId}')
    .onWrite(async (snapshot, context) => {

        const snapshotDB = await admin.database().ref(`/sheets/${context.params.sheetId}`).once('value');
        const sheetObject = snapshotDB.val();
        const array = Object.keys(sheetObject.expenses || {}).map(id => sheetObject.expenses[id]);

        let total = 0;
        let minDate = 0;
        let maxDate = 0;
        let days = 0;
        array.forEach(i => {
            if (i.tags && i.tags.indexOf('noavg') >= 0) {
                return;
            }
            total += Number(i.amount);
            if (!minDate || Number(i.date) < minDate) {
                minDate = Number(i.date);
            }
            if (!maxDate || Number(i.date) > maxDate) {
                maxDate = Number(i.date);
            }
        });
        days = moment().startOf('day').diff(moment(minDate).startOf('day'), 'days') + 1;
        console.log(`total = ${total} - diff between ${moment(minDate).format('dd/MM/yyyy')} and ${moment(maxDate).format('dd/MM/yyyy')} = ${days}`);
        return admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).set({
            ...sheetObject.statistics,
            total,
            average: total / days,
            minDate,
            maxDate,
            lastUpdate: (new Date()).getTime()
        });
    });

exports.onUpdateExpense = functions.database.ref('/sheets/{sheetId}/expenses/{expenseId}')
    .onUpdate(async (snapshot, context) => {

        const snapshotDB = await admin.database().ref(`/sheets/${context.params.sheetId}`).once('value');
        const sheetObject = snapshotDB.val();
        const array = Object.keys(sheetObject.expenses || {}).map(id => sheetObject.expenses[id]);

        const beforeValue = snapshot.before.val();
        const afterValue = snapshot.after.val();

        if (beforeValue.tags && beforeValue.tags.indexOf('noavg') >= 0 && afterValue.tags && afterValue.tags.indexOf('noavg') >= 0) {
            return;
        }

        const snapshotStatistics = await admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).once('value');
        const statistics = snapshotStatistics.val() || {};

        const beforeDate = moment(Number(beforeValue.date));
        const afterDate = moment(Number(afterValue.date));
        const beforePeriod = beforeDate.format('YYYY-MM');
        const afterPeriod = afterDate.format('YYYY-MM');

        if (beforePeriod === afterPeriod) {
            const periodStatistics = statistics[afterPeriod] || {
                total: 0,
                average: 0
            }
    
            statistics.total += Number(afterValue.amount) - Number(beforeValue.amount);
            periodStatistics.total += Number(afterValue.amount) - Number(beforeValue.amount);
            
            const totalDays = moment().startOf('day').diff(moment(statistics.createdAt).startOf('day'), 'days') + 1;
            let periodDays = date.startOf('day').diff(date.startOf('month').startOf('day'), 'days') + 1;
            if (moment().startOf('day').isSameOrAfter(date.endOf('month').startOf('day'))) {
                periodDays = date.endOf('month').startOf('day').diff(date.startOf('month').startOf('day'), 'days') + 1;
            }
            periodStatistics.average = periodStatistics.total / periodDays;

            const updateItem = {
                ...statistics,
                average: statistics.total / totalDays,
                days: totalDays,
                lastUpdate: (new Date()).getTime(),
                createdAt: statistics.createdAt || (new Date()).getTime()
            };
            updateItem[afterPeriod] = periodStatistics;
            
            await admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).set(updateItem);
        }
        else {
            const beforePeriodStatistics = statistics[beforePeriod] || {
                total: 0,
                average: 0
            }

            const afterPeriodStatistics = statistics[afterPeriod] || {
                total: 0,
                average: 0
            }
    
            statistics.total += Number(afterValue.amount) - Number(beforeValue.amount);
            beforePeriodStatistics.total -= Number(beforeValue.amount);
            afterPeriodStatistics.total += Number(afterValue.amount);

            beforePeriodStatistics.average = beforePeriodStatistics.total / beforePeriodStatistics.days;
            
            const totalDays = moment().startOf('day').diff(moment(statistics.createdAt).startOf('day'), 'days') + 1;
            let afterPeriodDays = afterDate.startOf('day').diff(afterDate.startOf('month').startOf('day'), 'days') + 1;
            if (moment().startOf('day').isSameOrAfter(afterDate.endOf('month').startOf('day'))) {
                afterPeriodDays = afterDate.endOf('month').startOf('day').diff(afterDate.startOf('month').startOf('day'), 'days') + 1;
            }
            afterPeriodStatistics.average = periodStatistics.total / afterPeriodDays;

            const updateItem = {
                ...statistics,
                average: statistics.total / totalDays,
                days: totalDays,
                lastUpdate: (new Date()).getTime(),
                createdAt: statistics.createdAt || (new Date()).getTime()
            };
            updateItem[beforePeriod] = beforePeriodStatistics;
            updateItem[afterPeriod] = afterPeriodStatistics;
            
            await admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).set(updateItem);
        }
    });

exports.onCreateExpense = functions.database.ref('/sheets/{sheetId}/expenses/{expenseId}')
    .onCreate(async (snapshot, context) => {

        const value = snapshot.val();

        if (value.tags.indexOf('noavg') >= 0) {
            return;
        }

        const date = moment(Number(value.date));
        const period = date.format('YYYY-MM');

        const snapshotStatistics = await admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).once('value');
        const statistics = snapshotStatistics.val() || {};

        const periodStatistics = statistics[period] || {
            total: 0,
            average: 0
        }

        statistics.total += Number(i.amount);
        periodStatistics.total += Number(i.amount);
        
        const totalDays = moment().startOf('day').diff(moment(statistics.createdAt).startOf('day'), 'days') + 1;
        let periodDays = date.startOf('day').diff(date.startOf('month').startOf('day'), 'days') + 1;
        if (moment().startOf('day').isSameOrAfter(date.endOf('month').startOf('day'))) {
            periodDays = date.endOf('month').startOf('day').diff(date.startOf('month').startOf('day'), 'days') + 1;
        }
        periodStatistics.average = periodStatistics.total / periodDays;

        const updateItem = {
            ...statistics,
            average: statistics.total / totalDays,
            days: totalDays,
            lastUpdate: (new Date()).getTime(),
            createdAt: statistics.createdAt || (new Date()).getTime()
        };
        updateItem[period] = periodStatistics;
        
        await admin.database().ref(`/sheets/${context.params.sheetId}/statistics`).set(updateItem);
    });
*/
exports.updateSheetName = functions.database
    .ref('/sheets/{sheetId}/name')
    .onWrite(async (snapshot, context) => {
        const { sheetId } = context.params;
        const name = snapshot.after.val();

        const snapshotUsers = await admin
            .database()
            .ref('/users')
            .once('value');
        let users = snapshotUsers.val();
        users = Object.keys(users).map(u => ({ ...users[u], uid: u }));
        users = users.filter(u => u.sheets && u.sheets[sheetId]);

        const updates = {};
        users.forEach(u => {
            updates[`users/${u.uid}/sheets/${sheetId}/name`] = name;
        });

        await admin
            .database()
            .ref()
            .update(updates);
    });

exports.removeOldFiles = functions.database
    .ref('/sheets/{sheetId}/expenses/{expenseId}/files')
    .onWrite(async (snapshot, context) => {
        const { sheetId, expenseId } = context.params;
        const files = snapshot.after.val() || [];
        const bucket = admin.storage().bucket();
        var fileList = await bucket.getFiles({
            prefix: `${sheetId}/${expenseId}`
        });

        if (fileList.length > 0) {
            for (let i = 0; i < fileList[0].length; i++) {
                const itemRef = fileList[0][i];
                const fullPath = itemRef.metadata.name.replace('thumb_', '');
                if (files.findIndex(f => f.url === fullPath) < 0) {
                    bucket.deleteFiles({
                        prefix: itemRef.metadata.name
                    });
                }
            }
        }
    });

exports.resizeImage = resizeImage(admin);

exports.rotateImage = rotateImage(admin);
