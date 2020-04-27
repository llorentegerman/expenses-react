import React, { useContext, createContext } from 'react';
import useFirebase from './useFirebase';

const expensesContext = createContext();

export function ProvideExpenses({ children }) {
    const expenses = useFirebase();
    return (
        <expensesContext.Provider value={expenses}>
            {children}
        </expensesContext.Provider>
    );
}

export const useExpenses = () => {
    return useContext(expensesContext);
};
