import React, { useEffect } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';
import useReactRouter from 'use-react-router';
import { LoadingComponent } from '../../commons/InitializingComponent';
import SortableListComponent from './SortableListComponent';
import { useExpenses } from '../../commons/useExpenses';

const styles = StyleSheet.create({
    title: {
        lineHeight: '36px',
        fontSize: 24,
        fontWeight: 'bold'
    },
    section: {
        marginTop: 20,
        borderTop: '1px solid #DFE0EB',
        paddingTop: 10
    }
});

function UserSettingsComponent() {
    const { history } = useReactRouter();
    const {
        initializing,
        loading_setUserSheets,
        setUserSheets,
        user
    } = useExpenses();

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (!initializing && !user) {
            return history.push('/login');
        }
    }, [history, initializing, user]);

    const onSave = async items => {
        const newItems = user.sheets;
        items.forEach(({ id, value, ...item }, index) => {
            newItems[id].metadata = {
                ...item,
                position: index
            };
        });
        await setUserSheets(newItems);
        history.push('/dashboard');
    };

    const onClose = () => history.push('/dashboard');

    if (!user) {
        return <div></div>;
    }
    const items = Object.keys(user.sheets || [])
        .map((value, index) => {
            const sheet = user.sheets[value];
            const metadata = sheet.metadata || {};
            return {
                value: sheet.name,
                position:
                    metadata.position !== undefined ? metadata.position : index,
                show: metadata.show,
                id: sheet.id
            };
        })
        .sort((a, b) => a.position - b.position);
    return (
        <LoadingComponent loading={loading_setUserSheets} fullScreen>
            <Column>
                <span className={css(styles.title)}>Settings</span>
                <Column className={css(styles.section)}>
                    <SortableListComponent
                        title="Sheets"
                        type="sheets"
                        items={items}
                        options={{
                            showShowButton: true,
                            hideStar: true,
                            hideRemove: true
                        }}
                        onClose={onClose}
                        onSave={onSave}
                    />
                </Column>
            </Column>
        </LoadingComponent>
    );
}

export default UserSettingsComponent;
