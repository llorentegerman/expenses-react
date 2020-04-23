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
