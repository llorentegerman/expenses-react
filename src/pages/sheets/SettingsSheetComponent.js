import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { useAsync } from 'react-async';
import useForm from 'react-hook-form';
import { Column, Row } from 'simple-flexbox';
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
    label: {
        fontWeight: 500,
        marginRight: 6
    },
    title: {
        lineHeight: '36px',
        fontSize: 24,
        fontWeight: 'bold'
    },
    subtitle: {
        lineHeight: '27px',
        fontSize: 18,
        marginTop: 4,
        marginBottom: 8
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
                {errors[fieldName].message || 'Campo requerido'}
            </span>
        );

    return (
        <LoadingComponent loading={loadingSheetName || loading} fullScreen>
            <Column>
                <span className={css(styles.title)}>Settings</span>

                <Column>
                    <Row style={{ marginTop: 12 }}>
                        <span className={css(styles.label)}>Name</span>
                        <input
                            name="name"
                            ref={register({ required: true })}
                            type="text"
                        />
                    </Row>
                    {renderError('date')}
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
                        onClick={handleSubmit(onSave)}
                    >
                        Save
                    </span>
                </Row>
            </Column>
        </LoadingComponent>
    );
}

export default SettingsComponent;