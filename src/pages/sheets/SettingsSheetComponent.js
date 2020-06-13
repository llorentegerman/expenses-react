import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { useAsync } from 'react-async';
import useForm from 'react-hook-form';
import { Column, Row } from 'simple-flexbox';
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

function SettingsComponent() {
    const { history, match } = useReactRouter();
    const { user, refreshUser } = useExpenses();

    const [loading, setLoading] = useState(false);

    const { errors, handleSubmit, register, reset } = useForm();

    const { data: sheetName, isPending: loadingSheetName } = useAsync({
        promiseFn: firebaseClient.getSheetName,
        sheetId: match.params.sheetId
    });

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (sheetName && user) {
            reset({
                name: sheetName
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetName, user]);

    const onSave = async ({ name }) => {
        setLoading(true);

        await firebaseClient.setSheetName({
            userId: user.uid,
            sheetId: match.params.sheetId,
            sheetName: name
        });
        await refreshUser();
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

    return (
        <LoadingComponent loading={loadingSheetName || loading} fullScreen>
            <Column className={css(styles.container)}>
                <span className={css(styles.title)}>Settings</span>

                <span className={css(styles.label)}>Name</span>
                <InputComponent
                    name="name"
                    placeholder="SHEET NAME"
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

export default SettingsComponent;
