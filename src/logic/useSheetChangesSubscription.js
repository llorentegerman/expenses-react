import { useState, useEffect } from 'react';
import { useExpenses } from './useExpenses';

export function useSheetChangesSubscription(sheetId) {
    const {
        formatData,
        user,
        logout,
        getSheet,
        getExpensesRef,
        getMetadataRef
    } = useExpenses();

    const [expenses, setExpenses] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [tags, setTags] = useState([]);

    useEffect(() => {
        let isInitialFetch = true;
        let _rawData = [];
        let _metadata = {};

        const getSheetFetch = async sheetId => {
            const getSheetResponse = await getSheet(sheetId);
            setExpenses(getSheetResponse.expenses);
            setStatistics(getSheetResponse.metadata.statistics);
            setTags(getSheetResponse.metadata.tags);
            _rawData = getSheetResponse.expensesRaw;
            _metadata = getSheetResponse.metadata;
            isInitialFetch = false;
        };
        if (sheetId && user) {
            const sheet = user.sheets[sheetId];
            if (!sheet) {
                logout();
            } else {
                const expensesRef = getExpensesRef(sheetId);
                const metadataRef = getMetadataRef(sheetId);
                expensesRef.on('child_added', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const array = [..._rawData, childSnapshot.val()];
                    _rawData = [...array];
                    const formatted = formatData(array);
                    setExpenses(formatted);
                });

                expensesRef.on('child_changed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const dataIndex = _rawData.findIndex(
                        d => d.id === childSnapshot.key
                    );
                    const newRawData = [..._rawData];
                    newRawData[dataIndex] = childSnapshot.val();
                    _rawData = [...newRawData];
                    const formatted = formatData(newRawData);
                    setExpenses(formatted);
                });

                expensesRef.on('child_removed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const dataIndex = _rawData.findIndex(
                        d => d.id === childSnapshot.key
                    );
                    const newRawData = [..._rawData];
                    newRawData.splice(dataIndex, 1);
                    const formatted = formatData(newRawData);
                    setExpenses(formatted);
                });

                metadataRef.on('child_added', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    _metadata[childSnapshot.key] = childSnapshot.val();
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                metadataRef.on('child_changed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    _metadata[childSnapshot.key] = childSnapshot.val();
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                metadataRef.on('child_removed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    delete _metadata[childSnapshot.key];
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                getSheetFetch(sheetId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetId]);

    return {
        expenses,
        statistics,
        tags
    };
}
