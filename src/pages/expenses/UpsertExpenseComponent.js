import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import useForm from 'react-hook-form';
import { useAsync } from 'react-async';
import { useExpenses } from '../../logic/useExpenses';
import firebaseClient from '../../logic/firebaseClient';
import {
    AutosuggestCustom,
    DatePickerComponent,
    ImageUploadComponent,
    InputComponent,
    LoadingComponent,
    TagsComponent
} from '../../components';
import {
    extractTagsFromMetadata,
    isFileAnImage,
    mapMetadataKeysToArray
} from '../../logic/utilities';

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
    errorText: {
        color: 'red',
        width: '95%'
    }
});

function AddExpenseComponent() {
    const { getFile, initializing } = useExpenses();
    const { history, match } = useReactRouter();
    const editMode = match.path === '/sheet/:sheetId/edit/:expenseId';

    const { errors, handleSubmit, register, reset, setValue, watch } = useForm({
        defaultValues: {}
    });

    const { data: expense, isPending: loadingExpense } = useAsync({
        promiseFn: firebaseClient.getExpenseById,
        sheetId: match.params.sheetId,
        expenseId: match.params.expenseId
    });

    const { data: metadata, isPending: loadingMetadata } = useAsync({
        promiseFn: firebaseClient.getMetadata,
        sheetId: match.params.sheetId
    });

    const [defaultExpense, setDefaultExpense] = useState();
    const [loadingUpsert, setLoadingUpsert] = useState(false);

    const [files, setFiles] = useState([]);
    const [filesChanged, setFilesChanged] = useState(0);

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        const loadFiles = async filteredExpense => {
            const newFiles = [];
            const expenseFiles = filteredExpense.files || [];
            for (let i = 0; i < expenseFiles.length; i++) {
                let url = expenseFiles[i].url;
                let publicUrl = url;
                try {
                    publicUrl = await firebaseClient.getFile(
                        expenseFiles[i].url
                    );
                } catch (e) {}

                if (!isFileAnImage(expenseFiles[i])) {
                    newFiles.push({
                        url,
                        name: expenseFiles[i].name,
                        publicUrl,
                        thumb: ''
                    });
                    continue;
                }

                const thumbFilename = `thumb_${expenseFiles[i].url.substring(
                    expenseFiles[i].url.lastIndexOf('/') + 1
                )}`;
                const thumbFolder = `${expenseFiles[i].url.substring(
                    0,
                    expenseFiles[i].url.lastIndexOf('/') + 1
                )}`;
                let thumb = `${thumbFolder}${thumbFilename}`;
                try {
                    thumb = await firebaseClient.getFile(
                        `${thumbFolder}${thumbFilename}`
                    );
                } catch (e) {}
                newFiles.push({
                    url,
                    name: expenseFiles[i].name,
                    publicUrl,
                    thumb
                });
            }
            setFiles(newFiles);
        };

        if (!initializing && !loadingExpense && !defaultExpense && metadata) {
            if (editMode) {
                if (!expense) {
                    const newDefault = { date: new Date() };
                    setDefaultExpense(newDefault);
                    reset(newDefault);
                } else {
                    const newDefault = {
                        ...expense,
                        date: new Date(+expense.date)
                    };
                    setDefaultExpense(newDefault);
                    reset(newDefault);
                    loadFiles(expense);
                }
            } else {
                const cities = Object.keys(metadata.cities || {});
                const defaultCity = cities.find(
                    c => metadata.cities[c].default
                );
                cities.sort(
                    (a, b) =>
                        metadata.cities[a].position -
                        metadata.cities[b].position
                );

                const categories = Object.keys(metadata.categories || {});
                const defaultCategory = categories.find(
                    c => metadata.categories[c].default
                );
                categories.sort(
                    (a, b) =>
                        metadata.categories[a].position -
                        metadata.categories[b].position
                );

                const currencies = Object.keys(metadata.currencies || {});
                const defaultCurrency = currencies.find(
                    c => metadata.currencies[c].default
                );
                currencies.sort(
                    (a, b) =>
                        metadata.currencies[a].position -
                        metadata.currencies[b].position
                );

                const methods = Object.keys(metadata.methods || {});
                const defaultMethod = methods.find(
                    c => metadata.methods[c].default
                );
                methods.sort(
                    (a, b) =>
                        metadata.methods[a].position -
                        metadata.methods[b].position
                );

                const newDefault = {
                    date: new Date(),
                    city: defaultCity,
                    category: defaultCategory,
                    currency: defaultCurrency,
                    method: defaultMethod
                };
                setDefaultExpense(newDefault);
                reset(newDefault);
            }
        }
    }, [
        editMode,
        match.params.expenseId,
        initializing,
        loadingExpense,
        getFile,
        expense,
        metadata,
        defaultExpense,
        reset
    ]);

    const cities = mapMetadataKeysToArray(metadata, 'cities');
    const categories = mapMetadataKeysToArray(metadata, 'categories');
    const currencies = mapMetadataKeysToArray(metadata, 'currencies');
    const methods = mapMetadataKeysToArray(metadata, 'methods');

    const { tags: tagsSuggestions } = extractTagsFromMetadata(metadata);

    if (!metadata) {
        return (
            <LoadingComponent
                loading={loadingExpense || loadingUpsert || loadingMetadata}
                fullScreen
            >
                <div></div>
            </LoadingComponent>
        );
    }

    const onSave = async ({ date, ...data }) => {
        const newData = {
            date: new Date(date).getTime(),
            ...data
        };
        newData.dateNeg = -newData.date;
        if (editMode) {
            newData.id = match.params.expenseId;
        }
        newData.files = files;
        setLoadingUpsert(true);
        await firebaseClient.upsertExpense({
            sheetId: match.params.sheetId,
            item: newData,
            metadata
        });
        reset();
        history.push(`/sheet/${match.params.sheetId}`);
    };

    const onClose = () => history.push(`/sheet/${match.params.sheetId}`);

    const renderError = fieldName =>
        errors[fieldName] && (
            <span className={css(styles.errorText)}>
                {errors[fieldName].message || 'Required field'}
            </span>
        );

    const tagsValues = (
        (watch('tags') !== undefined
            ? watch('tags')
            : defaultExpense
            ? defaultExpense.tags
            : '') || ''
    )
        .split(',')
        .filter(e => !!e)
        .map(v => ({ id: v, name: v }));

    return (
        <LoadingComponent
            loading={loadingExpense || loadingUpsert || loadingMetadata}
            fullScreen
        >
            <Column style={{ padding: 25, marginTop: 5 }} horizontal="center">
                <Column style={{ width: '100%', maxWidth: 500 }}>
                    <DatePickerComponent
                        name="date"
                        selected={
                            watch('date')
                                ? new Date(watch('date'))
                                : (defaultExpense || {}).date
                                ? new Date((defaultExpense || {}).date)
                                : new Date()
                        }
                        onChange={date => setValue('date', date)}
                        value={watch('date')}
                    />
                    <input
                        name="date"
                        ref={register({ required: true })}
                        type="hidden"
                    />
                    {renderError('date')}

                    <AutosuggestCustom
                        onChange={(_, { newValue }) =>
                            setValue('city', newValue)
                        }
                        placeholder="CITY"
                        value={watch('city', (defaultExpense || {}).city || '')}
                        values={cities}
                    />
                    <input
                        name="city"
                        ref={register({ required: true })}
                        type="hidden"
                    />
                    {renderError('city')}

                    <AutosuggestCustom
                        onChange={(_, { newValue }) =>
                            setValue('category', newValue)
                        }
                        placeholder="CATEGORY"
                        value={watch(
                            'category',
                            (defaultExpense || {}).category || ''
                        )}
                        values={categories}
                    />
                    <input
                        name="category"
                        ref={register({ required: true })}
                        type="hidden"
                    />
                    {renderError('category')}

                    <InputComponent
                        name="description"
                        placeholder="DESCRIPTION"
                        onChange={e => setValue('description', e.target.value)}
                        ref={register({ required: true })}
                        autoComplete="off"
                    />
                    {renderError('description')}

                    <TagsComponent
                        onAddition={tag => {
                            const newTags = tagsValues.slice(0);
                            if (newTags.find(i => i.name === tag.name)) {
                                return;
                            }
                            newTags.push(tag);
                            setValue(
                                'tags',
                                newTags.map(e => e.name).join(',')
                            );
                        }}
                        onDelete={i => {
                            const newTags = tagsValues.slice(0);
                            newTags.splice(i, 1);
                            setValue(
                                'tags',
                                newTags.map(e => e.name).join(',')
                            );
                        }}
                        suggestions={tagsSuggestions}
                        tags={tagsValues}
                    />
                    <input name="tags" ref={register({})} type="hidden" />
                    {renderError('tags')}

                    <InputComponent
                        type="number"
                        name="amount"
                        placeholder="AMOUNT"
                        onChange={e => setValue('amount', e.target.value)}
                        ref={register({
                            required: true,
                            validate: value =>
                                !isNaN(Number(value)) ||
                                'Debe ingresar un numero'
                        })}
                        autoComplete="off"
                    />
                    {renderError('amount')}

                    <AutosuggestCustom
                        onChange={(_, { newValue }) =>
                            setValue('currency', newValue)
                        }
                        placeholder="CURRENCY"
                        value={watch(
                            'currency',
                            (defaultExpense || {}).currency || ''
                        )}
                        values={currencies}
                    />
                    <input
                        name="currency"
                        ref={register({ required: true })}
                        type="hidden"
                    />
                    {renderError('currency')}

                    <AutosuggestCustom
                        onChange={(_, { newValue }) =>
                            setValue('method', newValue)
                        }
                        placeholder="Method"
                        value={watch(
                            'method',
                            (defaultExpense || {}).method || ''
                        )}
                        values={methods}
                    />
                    <input
                        name="method"
                        ref={register({ required: true })}
                        type="hidden"
                    />
                    {renderError('method')}

                    {(!editMode || (editMode && expense)) && (
                        <ImageUploadComponent
                            onChange={newFiles => {
                                setFilesChanged(filesChanged + 1);
                                return setFiles(newFiles);
                            }}
                            files={files}
                            filesChanged={filesChanged}
                            hasFiles={
                                !editMode
                                    ? false
                                    : (expense.files || []).length > 0
                            }
                        />
                    )}
                    <Row
                        flexGrow={1}
                        style={{ marginTop: 20 }}
                        horizontal="spaced"
                    >
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
                            onClick={handleSubmit(onSave)}
                        >
                            Save
                        </span>
                    </Row>
                </Column>
            </Column>
        </LoadingComponent>
    );
}

export default AddExpenseComponent;
