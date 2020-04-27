exports.addNegativeDate = async admin => {
    console.log('checkpoint 1');
    const snapshotDB = await admin
        .database()
        .ref('/sheets')
        .once('value');
    console.log('checkpoint 2');
    const sheetsObject = snapshotDB.val();
    console.log('checkpoint 3');
    const sheetsKeys = Object.keys(sheetsObject || {});

    console.log('checkpoint 4');
    for (let i = 0; i < sheetsKeys.length; i++) {
        const sheet = sheetsObject[sheetsKeys[i]];
        const expensesIds = Object.keys(sheet.expenses || {});
        // console.log(`sheetId: ${sheet.id}, expenses: ${expensesIds.length} `);
        for (let j = 0; j < expensesIds.length; j++) {
            const expenseId = expensesIds[j];
            const expense = sheet.expenses[expenseId];
            expense.dateNeg = -expense.date;
            // sheetsObject[sheetsKeys[i]].expenses[expenseId].dateNeg = expense.date;
        }
    }

    console.log('checkpoint 5');
    console.log(
        sheetsObject['-LpVuN8cR21tJyfA5SK_'].expenses['-LpVuehi0g6NBn7SNYu0']
            .dateNeg
    );
    console.log('checkpoint 6');

    await admin
        .database()
        .ref('/sheets')
        .set(sheetsObject);
    console.log('checkpoint 7');
};
