import { useState, useEffect } from 'react';
import firebaseClient from './firebaseClient';
import { useExpenses } from './useExpenses';
import { sortExpensesByDate } from './utilities';

export function useSheetChangesSubscription(sheetId) {
    const { user, logout } = useExpenses();

    const [expenses, setExpenses] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let expensesRef;
        let metadataRef;

        let isInitialFetch = true;
        let _rawData = [];
        let _metadata = {};

        const getSheetFetch = async sheetId => {
            const getSheetResponse = await firebaseClient.getSheet({ sheetId });
            setExpenses(getSheetResponse.expenses);
            setStatistics(getSheetResponse.metadata.statistics);
            setTags(getSheetResponse.metadata.tags);
            _rawData = getSheetResponse.expenses;
            _metadata = getSheetResponse.metadata;
            isInitialFetch = false;
            setLoading(false);
        };
        if (sheetId && user) {
            const sheet = user.sheets[sheetId];
            if (!sheet) {
                logout();
            } else {
                expensesRef = firebaseClient.getExpensesRef({ sheetId });
                metadataRef = firebaseClient.getMetadataRef({ sheetId });
                expensesRef.on('child_added', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const array = [..._rawData, childSnapshot.val()];
                    _rawData = [...array];
                    const formatted = sortExpensesByDate(array);
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
                    const formatted = sortExpensesByDate(newRawData);
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
                    const formatted = sortExpensesByDate(newRawData);
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

        return () => {
            if (expensesRef) {
                expensesRef.off();
            }
            if (metadataRef) {
                metadataRef.off();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetId]);

    return {
        expenses,
        loading,
        statistics,
        tags
    };
}
