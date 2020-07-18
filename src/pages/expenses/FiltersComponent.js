import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { useAsync } from 'react-async';
import useReactRouter from 'use-react-router';
import firebaseClient from '../../logic/firebaseClient';
import {
    ButtonComponent,
    DatePickerComponent,
    InputComponent,
    LoadingComponent,
    TagsComponent
} from '../../components';
import { extractTagsFromMetadata, mapArrayToTags } from '../../logic/utilities';

const styles = StyleSheet.create({
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
    title: {
        margin: 0
    },
    subTitle: {
        margin: '10px 0px 2px 0px',
        fontSize: 16
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
        categories: mapArrayToTags(filters.categories),
        cities: mapArrayToTags(filters.cities),
        currencies: mapArrayToTags(filters.currencies),
        methods: mapArrayToTags(filters.methods),
        tags: mapArrayToTags(filters.tags),
        dateFrom: filters.dateFrom && new Date(filters.dateFrom),
        dateTo: filters.dateTo && new Date(filters.dateTo)
    });

    const {
        categories,
        cities,
        currencies,
        methods,
        tags
    } = extractTagsFromMetadata(metadata);

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
                    <TagFilter
                        title="Categories"
                        type="categories"
                        suggestions={categories}
                        noStyles={true}
                        setCurrentFilters={setCurrentFilters}
                        currentFilters={currentFilters}
                    />
                </Row>

                <Row>
                    <TagFilter
                        title="Cities"
                        type="cities"
                        suggestions={cities}
                        setCurrentFilters={setCurrentFilters}
                        currentFilters={currentFilters}
                    />
                    <TagFilter
                        title="Currencies"
                        type="currencies"
                        suggestions={currencies}
                        setCurrentFilters={setCurrentFilters}
                        currentFilters={currentFilters}
                    />
                </Row>
                <Row>
                    <TagFilter
                        title="Methods"
                        type="methods"
                        suggestions={methods}
                        setCurrentFilters={setCurrentFilters}
                        currentFilters={currentFilters}
                    />

                    <TagFilter
                        title="Tags"
                        type="tags"
                        suggestions={tags}
                        setCurrentFilters={setCurrentFilters}
                        currentFilters={currentFilters}
                    />
                </Row>

                <Column>
                    <Row horizontal="spaced">
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>Date From:</h3>
                            <DatePickerComponent
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
                                value={
                                    currentFilters.dateFrom
                                        ? new Date(currentFilters.dateFrom)
                                        : null
                                }
                            />
                        </Column>
                        <Column
                            flexGrow={1}
                            className={css(styles.inputGroupRow)}
                        >
                            <h3 className={css(styles.subTitle)}>Date To:</h3>
                            <DatePickerComponent
                                startOpen={false}
                                name="date-to"
                                selected={
                                    currentFilters.dateTo
                                        ? new Date(currentFilters.dateTo)
                                        : null
                                }
                                onChange={date => onValueChange('dateTo', date)}
                                value={
                                    currentFilters.dateTo
                                        ? new Date(currentFilters.dateTo)
                                        : null
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
                            <InputComponent
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
                            <InputComponent
                                value={currentFilters.amountTo}
                                onChange={e =>
                                    onValueChange('amountTo', e.target.value)
                                }
                            />
                        </Column>
                    </Row>
                </Column>

                <Row flexGrow={1} style={{ marginTop: 20 }} horizontal="spaced">
                    <ButtonComponent
                        color="red"
                        label="Cancel"
                        onClick={onClose}
                    />

                    <ButtonComponent
                        color="green"
                        label="Apply Filters"
                        onClick={onApplyFilters}
                    />
                </Row>
            </Column>
        </LoadingComponent>
    );
}

function TagFilter({
    title,
    type,
    suggestions,
    noStyles,
    setCurrentFilters,
    currentFilters
}) {
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

    return (
        <Column flexGrow={1} className={!noStyles && css(styles.inputGroupRow)}>
            <h3 className={css(styles.subTitle)}>{title}:</h3>
            <TagsComponent
                onAddition={tag => onTagAdd(type, tag)}
                onDelete={index => onTagDelete(type, index)}
                suggestions={suggestions}
                placeholder={`Select ${title}`}
                tags={currentFilters[type]}
            />
        </Column>
    );
}

export default FiltersComponent;
