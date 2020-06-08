import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import useForm from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { useExpenses } from '../../logic/useExpenses';
import firebaseClient from '../../logic/firebaseClient';
import {
    ButtonComponent,
    InputComponent,
    LoadingComponent
} from '../../components';

const styles = StyleSheet.create({
    container: {
        margin: '0 auto',
        maxWidth: 500
    },
    errorText: {
        color: 'red',
        width: '95%'
    },
    label: {
        fontWeight: 500,
        marginRight: 6
    },
    title: {
        lineHeight: '36px',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    }
});

function AddExpenseComponent() {
    const { refreshUser, user } = useExpenses();
    const { history } = useReactRouter();

    const { errors, handleSubmit, register, reset, setValue } = useForm();

    const [loading, setLoading] = useState(false);

    const onSave = async ({ name }) => {
        setLoading(true);
        const sheetId = await firebaseClient.addSheet({ name, user });
        reset();
        await refreshUser();
        history.push(`/sheet/${sheetId}`);
    };

    const onClose = () => history.push('/');

    const renderError = fieldName =>
        errors[fieldName] && (
            <span className={css(styles.errorText)}>
                {errors[fieldName].message || 'Required field'}
            </span>
        );

    return (
        <LoadingComponent loading={loading} fullScreen>
            <Column className={css(styles.container)}>
                <span className={css(styles.title)}>Create New Sheet</span>
                <span className={css(styles.label)}>Name</span>
                <InputComponent
                    name="name"
                    placeholder="SHEET NAME"
                    onChange={e => setValue('name', e.target.value)}
                    ref={register({ required: true })}
                />
                {renderError('name')}

                <Row flexGrow={1} style={{ marginTop: 20 }} horizontal="spaced">
                    <ButtonComponent
                        color="red"
                        label="Cancel"
                        onClick={onClose}
                    />
                    <ButtonComponent
                        color="green"
                        label="Save"
                        onClick={handleSubmit(onSave)}
                    />
                </Row>
            </Column>
        </LoadingComponent>
    );
}

export default AddExpenseComponent;
