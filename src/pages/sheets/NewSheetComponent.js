import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import useForm from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { useExpenses } from '../../logic/useExpenses';
import firebaseClient from '../../logic/firebaseClient';
import { LoadingComponent } from '../../commons/InitializingComponent';

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
        width: '100%',
        marginTop: 4
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

    const onClose = () => history.push(`/`);

    const renderError = fieldName =>
        errors[fieldName] && (
            <span className={css(styles.errorText)}>
                {errors[fieldName].message || 'Campo requerido'}
            </span>
        );

    return (
        <LoadingComponent loading={loading} fullScreen>
            <Column style={{ padding: 25, marginTop: 5 }} horizontal="center">
                <Column style={{ width: '100%', maxWidth: 500 }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="NOMBRE"
                        onChange={e => setValue('name', e.target.value)}
                        ref={register({ required: true })}
                        className={css(styles.inputField)}
                    />
                    {renderError('name')}

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
