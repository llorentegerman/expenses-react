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
