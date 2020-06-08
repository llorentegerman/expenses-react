import React, { useCallback, useState } from 'react';
import Autosuggest from 'react-autosuggest';

const theme = {
    container: {
        position: 'relative'
    },
    input: {
        height: 40,
        fontSize: 16,
        marginTop: 4,
        outline: 'none',
        width: 'calc(100% - 8px)'
    },
    inputFocused: {
        outline: 'none'
    },
    inputOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    suggestionsContainer: {
        display: 'none'
    },
    suggestionsContainerOpen: {
        display: 'block',
        position: 'absolute',
        top: 45,
        width: 300,
        border: '1px solid #aaa',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        zIndex: 2
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none'
    },
    suggestion: {
        cursor: 'pointer'
    },
    suggestionHighlighted: {
        backgroundColor: '#ddd'
    }
};

function AutosuggestCustom({ onChange, placeholder, value, values }) {
    const [suggestionsValues, setSuggestionsValues] = useState([]);
    const [initializingValues, setInitializingValues] = useState(true);

    const getSuggestionsValues = useCallback(
        value => {
            if (initializingValues) {
                setInitializingValues(false);
                return values;
            }
            const inputValue = value.trim().toLowerCase();
            const inputLength = inputValue.length;

            return inputLength === 0
                ? values
                : values.filter(
                      lang =>
                          lang.toLowerCase().slice(0, inputLength) ===
                          inputValue
                  );
        },
        [values, initializingValues]
    );

    return (
        <Autosuggest
            suggestions={suggestionsValues}
            onSuggestionsFetchRequested={({ value }) =>
                setSuggestionsValues(getSuggestionsValues(value))
            }
            onSuggestionsClearRequested={() => setSuggestionsValues([])}
            getSuggestionValue={value => value}
            renderSuggestion={suggestion => <div>{suggestion}</div>}
            shouldRenderSuggestions={() => true}
            theme={theme}
            inputProps={{
                placeholder,
                value,
                onChange
            }}
        />
    );
}

export default AutosuggestCustom;
