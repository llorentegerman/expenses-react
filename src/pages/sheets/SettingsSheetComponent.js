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
    const {
        user,
        getSheet,
        logout,
        setMetadata,
        setSheetId,
        setSheetName
    } = useExpenses();

    const { errors, handleSubmit, register, reset } = useForm();

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (match.params.sheetId && user) {
            const getSheetFetch = async sheetId => {
                const getSheetResponse = await getSheet(sheetId);
                reset({
                    name: getSheetResponse.name,
                    files: (getSheetResponse.metadata.features || {}).files
                });
            };
            const sheet = user.sheets[match.params.sheetId];
            if (!sheet) {
                logout();
            } else {
                if (match.params.sheetId !== sheet.id) {
                    setSheetId(match.params.sheetId);
                }
                getSheetFetch(match.params.sheetId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.params.sheetId]);

    const onSave = async ({ name, files }) => {
        setSheetName(match.params.sheetId, name);
        setMetadata(match.params.sheetId, 'features', {
            files
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
                <Row style={{ marginTop: 12 }}>
                    <span className={css(styles.label)}>Features</span>
                    <Column>
                        <Row>
                            <input
                                name="files"
                                ref={register}
                                type="checkbox"
                            />
                            <span style={{ marginLeft: 4 }}>ARCHIVOS</span>
                        </Row>
                    </Column>
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
