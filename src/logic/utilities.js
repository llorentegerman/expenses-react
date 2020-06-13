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

export const daysDiff = (from, to) => {
    const a = moment(from).startOf('day');
    const b = moment(to).startOf('day');
    return a.diff(b, 'days') + 1;
};

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

export const mapMetadataKeysToArray = (metadata, metadataKey) =>
    (Object.keys((metadata || {})[metadataKey] || {}) || []).sort(
        (a, b) =>
            metadata[metadataKey][a].position -
            metadata[metadataKey][b].position
    );

export const mapArrayToTags = array =>
    (array && array.map(v => ({ id: v, name: v }))) || [];

export const extractTagsFromMetadata = metadata => {
    const categories = mapArrayToTags(
        mapMetadataKeysToArray(metadata, 'categories')
    );
    const cities = mapArrayToTags(mapMetadataKeysToArray(metadata, 'cities'));
    const currencies = mapArrayToTags(
        mapMetadataKeysToArray(metadata, 'currencies')
    );
    const methods = mapArrayToTags(mapMetadataKeysToArray(metadata, 'methods'));
    const tags = mapArrayToTags(mapMetadataKeysToArray(metadata, 'tags'));

    return {
        categories,
        cities,
        currencies,
        methods,
        tags
    };
};

export const getPeriods = statistics => {
    const periods = [];
    if (statistics) {
        Object.keys(statistics).forEach(p => {
            if (typeof statistics[p] === 'object' && p !== 'categories') {
                periods.push({
                    ...statistics[p],
                    periodo: p
                });
            }
        });
    }
    return periods;
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

export const calculateStatistics = expenses => {
    const totalDays = daysDiff(
        expenses[0].date,
        expenses[expenses.length - 1].date
    );
    let result = {
        total: 0,
        average: 0,
        categories: {},
        days: totalDays,
        periodo: 'Filtered'
    };
    expenses.forEach(i => {
        if (i.tags && i.tags.indexOf('noavg') >= 0) {
            return;
        }
        result.total += Number(i.amount);
        result.average = result.total / totalDays;
        if (!result.categories[i.category]) {
            result.categories[i.category] = {
                total: 0,
                average: 0
            };
        }

        result.categories[i.category].total += Number(i.amount);
        result.categories[i.category].average =
            result.categories[i.category].total / totalDays;
    });

    return result;
};
