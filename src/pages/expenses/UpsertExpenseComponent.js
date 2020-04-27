import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import useForm from 'react-hook-form';
import { useAsync } from 'react-async';
import DatePicker from 'react-datepicker';
import ReactTags from 'react-tag-autocomplete';
import 'react-datepicker/dist/react-datepicker.css';
import { useExpenses } from '../../logic/useExpenses';
import firebaseClient from '../../logic/firebaseClient';
import { LoadingComponent } from '../../commons/InitializingComponent';
import ImageUploadComponent from '../../commons/ImageUpload';
import AutosuggestCustom from '../../commons/AutosuggestCustom';
import { isFileAnImage } from '../../logic/utilities';
import '../../commons/styles/tags.css';

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
    },
    inputField: {
        height: 40,
        fontSize: 16,
        marginTop: 4,
        width: '99%',
        maxWidth: 500
    },
    reactTagsContainer: {
        ':nth-child(n) > div': {
            width: '99%'
        }
    }
});

function AddExpenseComponent() {
    const { getFile, initializing } = useExpenses();
    const { history, match } = useReactRouter();
    const editMode = match.path === '/sheet/:sheetId/edit/:expenseId';

    const { errors, handleSubmit, register, reset, setValue, watch } = useForm({
        defaultValues: {
            date: new Date()
        }
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

    const cities = useMemo(() => {
        if (metadata && metadata.cities) {
            return Object.keys(metadata.cities);
        }
        return [];
    }, [metadata]);

    const categories = useMemo(() => {
        if (metadata && metadata.categories) {
            const categories = Object.keys(metadata.categories || {});
            categories.sort(
                (a, b) =>
                    metadata.categories[a].position -
                    metadata.categories[b].position
            );
            return categories;
        }
        return [];
    }, [metadata]);

    const currencies = useMemo(() => {
        if (metadata && metadata.currencies) {
            const currencies = Object.keys(metadata.currencies || {});
            currencies.sort(
                (a, b) =>
                    metadata.currencies[a].position -
                    metadata.currencies[b].position
            );
            return currencies;
        }
        return [];
    }, [metadata]);

    const methods = useMemo(() => {
        if (metadata && metadata.methods) {
            const methods = Object.keys(metadata.methods || {});
            methods.sort(
                (a, b) =>
                    metadata.methods[a].position - metadata.methods[b].position
            );
            return methods;
        }
        return [];
    }, [metadata]);

    const tagsSuggestions = useMemo(() => {
        if (metadata && metadata.tags) {
            return Object.keys(metadata.tags).map(t => ({ id: t, name: t }));
        }
        return [];
    }, [metadata]);

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
                {errors[fieldName].message || 'Campo requerido'}
            </span>
        );

    const tagsValues = (watch('tags') || '')
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
                    <DatePicker
                        name="date"
                        selected={new Date(watch('date'))}
                        onChange={date => setValue('date', date)}
                        dateFormat="dd/MM/yyyy"
                        customInput={
                            <input
                                type="text"
                                className={css(styles.inputField)}
                                value={watch('date')}
                            />
                        }
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
                        placeholder="CIUDAD"
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
                        placeholder="CATEGORIA"
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

                    <input
                        type="text"
                        name="description"
                        placeholder="DESCRIPCION"
                        onChange={e => setValue('description', e.target.value)}
                        ref={register({ required: true })}
                        className={css(styles.inputField)}
                        autoComplete="off"
                    />
                    {renderError('description')}

                    <Column className={css(styles.reactTagsContainer)}>
                        <ReactTags
                            tags={tagsValues}
                            suggestions={tagsSuggestions}
                            onDelete={i => {
                                const newTags = tagsValues.slice(0);
                                newTags.splice(i, 1);
                                setValue(
                                    'tags',
                                    newTags.map(e => e.name).join(',')
                                );
                            }}
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
                            minQueryLength={0}
                            allowNew
                            style={{ marginTop: 20 }}
                        />
                    </Column>
                    <input name="tags" ref={register({})} type="hidden" />
                    {renderError('tags')}

                    <input
                        type="number"
                        name="amount"
                        placeholder="MONTO"
                        onChange={e => setValue('amount', e.target.value)}
                        ref={register({
                            required: true,
                            validate: value =>
                                !isNaN(Number(value)) ||
                                'Debe ingresar un numero'
                        })}
                        className={css(styles.inputField)}
                        autoComplete="off"
                    />
                    {renderError('amount')}

                    <AutosuggestCustom
                        onChange={(_, { newValue }) =>
                            setValue('currency', newValue)
                        }
                        placeholder="MONEDA"
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
                        placeholder="METODO"
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
                            Cancelar
                        </span>

                        <span
                            className={css(styles.button)}
                            style={{ backgroundColor: 'green' }}
                            onClick={handleSubmit(onSave)}
                        >
                            Guardar
                        </span>
                    </Row>
                </Column>
            </Column>
        </LoadingComponent>
    );
}

export default AddExpenseComponent;
