import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { useAsync } from 'react-async';
import useReactRouter from 'use-react-router';
import ReactTags from 'react-tag-autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import firebaseClient from '../../logic/firebaseClient';
import { LoadingComponent } from '../../components';
import '../../components/styles/tags.css';

const styles = StyleSheet.create({
    button: {
        borderRadius: 5,
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600,
        padding: '8px 10px',
        width: 90,
        textAlign: 'center'
    },
    closeButton: {
        border: '1px dashed',
        cursor: 'pointer',
        lineHeight: '20px',
        padding: '5px 8px',
        right: 5,
        top: 5,
        ':hover': {
            backgroundColor: 'rgba(0,0,0,.05)'
        }
    },
    container: {
        backgroundColor: 'white',
        maxWidth: 548,
        minWidth: '30vw',
        width: '100%',
        '@media (max-width: 1068px)': {
            minWidth: 600
        },
        '@media (max-width: 768px)': {
            minWidth: '80vw'
        }
    },
    inputField: {
        height: 40,
        fontSize: 16,
        padding: 0,
        margin: 0,
        marginTop: 4,
        width: 'calc(100% - 4px)'
    },
    title: {
        margin: 0
    },
    subTitle: {
        margin: '10px 0px 2px 0px',
        fontSize: 16
    },
    reactTagsContainer: {
        ':nth-child(n) > div': {
            border: '1px solid rgb(118, 118, 118)',
            width: 'calc(100% - 4px)'
        }
    },
    inputGroupRow: {
        width: '50%',
        ':last-child': {
            marginLeft: 8
        },
        '@media (max-width: 768px)': {
            marginLeft: 0,
            width: '100%'
        }
    }
});

function FiltersComponent({ filters = {}, onApply, onClose }) {
    const { match } = useReactRouter();
    const { data: metadata, isPending: loading } = useAsync({
        promiseFn: firebaseClient.getMetadata,
        sheetId: match.params.sheetId
    });
    const [currentFilters, setCurrentFilters] = useState({
        amountFrom: filters.amountFrom || '',
        amountTo: filters.amountTo || '',
        categories:
            (filters.categories &&
                filters.categories.map(v => ({ id: v, name: v }))) ||
            [],
        cities:
            (filters.cities && filters.cities.map(v => ({ id: v, name: v }))) ||
            [],
        currencies:
            (filters.currencies &&
                filters.currencies.map(v => ({ id: v, name: v }))) ||
            [],
        methods:
            (filters.methods &&
                filters.methods.map(v => ({ id: v, name: v }))) ||
            [],
        tags:
            (filters.tags && filters.tags.map(v => ({ id: v, name: v }))) || [],
        dateFrom: filters.dateFrom && new Date(filters.dateFrom),
        dateTo: filters.dateTo && new Date(filters.dateTo)
    });

    const categories = metadata
        ? Object.keys(metadata.categories).map(v => ({ id: v, name: v }))
        : [];

    const cities = metadata
        ? Object.keys(metadata.cities).map(v => ({ id: v, name: v }))
        : [];

    const currencies = metadata
        ? Object.keys(metadata.currencies).map(v => ({ id: v, name: v }))
        : [];

    const methods = metadata
        ? Object.keys(metadata.methods).map(v => ({ id: v, name: v }))
        : [];

    const tags = metadata
        ? Object.keys(metadata.tags).map(v => ({ id: v, name: v }))
        : [];

    const onApplyFilters = () => {
        const newFilters = {
            ...currentFilters,
            categories: currentFilters.categories.map(c => c.name),
            cities: currentFilters.cities.map(c => c.name),
            currencies: currentFilters.currencies.map(c => c.name),
            methods: currentFilters.methods.map(c => c.name),
            tags: currentFilters.tags.map(c => c.name),
            dateFrom:
                currentFilters.dateFrom && currentFilters.dateFrom.getTime(),
            dateTo: currentFilters.dateTo && currentFilters.dateTo.getTime()
        };
        const hasFilters = Object.keys(newFilters).some(
            f => !!newFilters[f] && newFilters[f].toString().length > 0
        );
        onApply(hasFilters ? newFilters : {});
    };

    const onValueChange = (type, value) =>
        setCurrentFilters(prev => {
            const newFilters = { ...prev };
            newFilters[type] = value;
            return newFilters;
        });

    const onTagAdd = (type, tag) =>
        setCurrentFilters(prev => {
            const array = [...prev[type]];
            if (array.find(i => i.id === tag.id)) {
                return prev;
            }
            array.push(tag);
            const newFilters = { ...prev };
            newFilters[type] = array;
            return newFilters;
        });

    const onTagDelete = (type, index) =>
        setCurrentFilters(prev => {
            const array = [...prev[type]];
            array.splice(index, 1);
            const newFilters = { ...prev };
            newFilters[type] = array;
            return newFilters;
        });

    const renderTagFilter = ({ title, type, suggestions, noStyles }) => (
        <Column flexGrow={1} className={!noStyles && css(styles.inputGroupRow)}>
            <h3 className={css(styles.subTitle)}>{title}:</h3>
            <Column flexGrow={1} className={css(styles.reactTagsContainer)}>
                <ReactTags
                    tags={currentFilters[type]}
                    suggestions={suggestions}
                    onDelete={index => onTagDelete(type, index)}
                    onAddition={tag => onTagAdd(type, tag)}
                    minQueryLength={0}
                    maxSuggestionsLength={10}
                    placeholder={`Select ${title}`}
                />
            </Column>
        </Column>
    );

    return (
        <LoadingComponent loading={loading} fullScreen>
            <Column className={css(styles.container)}>
                <Row horizontal="spaced">
                    <h1 className={css(styles.title)}>Filters</h1>
                    <div>
                        <span
                            className={css(styles.closeButton)}
                            onClick={onClose}
                        >
                            &#10005;
                        </span>
                    </div>
                </Row>

                <Row>
                    {renderTagFilter({
                        title: 'Categories',
                        type: 'categories',
                        suggestions: categories,
                        noStyles: true
                    })}
                </Row>

                <Row>
                    {renderTagFilter({
                        title: 'Cities',
                        type: 'cities',
                        suggestions: cities
                    })}
                    {renderTagFilter({
                        title: 'Currencies',
                        type: 'currencies',
                        suggestions: currencies
                    })}
                </Row>
                <Row>
                    {renderTagFilter({
                        title: 'Methods',
                        type: 'methods',
                        suggestions: methods
                    })}

                    {renderTagFilter({
                        title: 'Tags',
                        type: 'tags',
                        suggestions: tags
                    })}
                </Row>

                <Column>
                    <Row horizontal="spaced">
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>Date From:</h3>
                            <DatePicker
                                startOpen={false}
                                name="date-from"
                                selected={
                                    currentFilters.dateFrom
                                        ? new Date(currentFilters.dateFrom)
                                        : null
                                }
                                onChange={date =>
                                    onValueChange('dateFrom', date)
                                }
                                dateFormat="dd/MM/yyyy"
                                customInput={
                                    <input
                                        type="text"
                                        className={css(styles.inputField)}
                                        value={
                                            currentFilters.dateFrom
                                                ? new Date(
                                                      currentFilters.dateFrom
                                                  )
                                                : null
                                        }
                                    />
                                }
                            />
                        </Column>
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>Date To:</h3>
                            <DatePicker
                                startOpen={false}
                                name="date-to"
                                selected={
                                    currentFilters.dateTo
                                        ? new Date(currentFilters.dateTo)
                                        : null
                                }
                                onChange={date => onValueChange('dateTo', date)}
                                dateFormat="dd/MM/yyyy"
                                customInput={
                                    <input
                                        type="text"
                                        className={css(styles.inputField)}
                                        value={
                                            currentFilters.dateTo
                                                ? new Date(
                                                      currentFilters.dateTo
                                                  )
                                                : null
                                        }
                                    />
                                }
                            />
                        </Column>
                    </Row>
                </Column>

                <Column>
                    <Row horizontal="spaced">
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>
                                Amount From:
                            </h3>
                            <input
                                type="text"
                                className={css(styles.inputField)}
                                value={currentFilters.amountFrom}
                                onChange={e =>
                                    onValueChange('amountFrom', e.target.value)
                                }
                            />
                        </Column>
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>Amount To:</h3>
                            <input
                                type="text"
                                className={css(styles.inputField)}
                                value={currentFilters.amountTo}
                                onChange={e =>
                                    onValueChange('amountTo', e.target.value)
                                }
                            />
                        </Column>
                    </Row>
                </Column>

                <Row flexGrow={1} style={{ marginTop: 20 }} horizontal="spaced">
                    <span
                        className={css(styles.button)}
                        style={{ backgroundColor: 'red' }}
                        onClick={onClose}
                    >
                        Cancel
                    </span>

                    <span
                        className={css(styles.button)}
                        style={{ backgroundColor: 'green' }}
                        onClick={onApplyFilters}
                    >
                        Apply
                    </span>
                </Row>
            </Column>
        </LoadingComponent>
    );
}

export default FiltersComponent;
