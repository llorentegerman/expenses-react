import moment from 'moment';

export const numberFormat = (value, decimals = 2) => {
    let number = value.toString().replace(',', '.');
    number = Number(number);
    // if (number > 999) {
    //     return number.toFixed(0);
    // }
    return number.toFixed(decimals);
};

export const getDaysInPeriod = period =>
    moment(`${period}-01`, 'YYYY-MM-DD').daysInMonth();

export const isDateBetweenDates = (date, from, to) => {
    const value = moment(date);
    return (
        (!from || moment(from).isSameOrBefore(value, 'day')) &&
        (!to || moment(to).isSameOrAfter(value, 'day'))
    );
};

export const isFileAnImage = file =>
    !(
        (file.type && file.type !== 'image/jpeg') ||
        (file.path &&
            file.path
                .split('.')
                .pop()
                .toLowerCase() === 'pdf') ||
        (file.url &&
            file.url
                .split('.')
                .pop()
                .toLowerCase() === 'pdf')
    );

export const sortExpensesByDate = data => {
    const array = [...data];
    array.sort((a, b) => {
        a = a.date;
        b = b.date;
        return a > b ? -1 : a < b ? 1 : 0;
    });
    return array;
};

export const applyFilters = (
    expenses,
    {
        amountFrom,
        amountTo,
        categories,
        cities,
        currencies,
        dateFrom,
        dateTo,
        methods,
        tags
    }
) => {
    return expenses.filter(
        expense =>
            (!categories ||
                categories.length === 0 ||
                categories.includes(expense.category)) &&
            (!cities || cities.length === 0 || cities.includes(expense.city)) &&
            (!currencies ||
                currencies.length === 0 ||
                currencies.includes(expense.currency)) &&
            (!methods ||
                methods.length === 0 ||
                methods.includes(expense.method)) &&
            (!tags ||
                tags.length === 0 ||
                expense.tags.split(',').filter(tag => tags.includes(tag))
                    .length > 0) &&
            isDateBetweenDates(expense.date, dateFrom, dateTo) &&
            (!amountFrom || Number(amountFrom) <= expense.amount) &&
            (!amountTo || Number(amountTo) >= expense.amount)
    );
};
