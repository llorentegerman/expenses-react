import React, { useEffect } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import useForm from 'react-hook-form';
import { Column, Row } from 'simple-flexbox';
import { useExpenses } from '../../commons/useExpenses';

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

function SettingsComponent(props) {
    const { history, match } = useReactRouter();
    const expenses = useExpenses();

    const { errors, handleSubmit, register, reset } = useForm();

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (match.params.sheetId && expenses.user) {
            const sheet = expenses.user.sheets[match.params.sheetId];
            if (!sheet) {
                expenses.logout();
            } else {
                if (match.params.sheetId !== sheet.id) {
                    expenses.setSheetId(match.params.sheetId);
                }
                reset({ name: sheet.name });
            }
        }
    }, [match.params.sheetId, expenses, reset]);

    const onSave = async ({ name }) => {
        expenses.setSheetName(match.params.sheetId, name);
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
    );
}

export default SettingsComponent;
