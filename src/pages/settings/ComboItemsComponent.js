import React, { useEffect, useState } from 'react';
import useReactRouter from 'use-react-router';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';
import { useAsync } from 'react-async';
import firebaseClient from '../../logic/firebaseClient';
import { LoadingComponent } from '../../commons/InitializingComponent';
import SortableListComponent from './SortableListComponent';

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
    item: {
        borderRadius: 4,
        backgroundColor: '#FDFDFD',
        border: '1px solid #E7EBF0',
        marginTop: 2,
        padding: '4px 8px'
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

function ComboItemsComponent({ title, type, options = {} }) {
    const { history, match } = useReactRouter();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [currentType, setCurrentType] = useState([]);

    const { data: metadata, error, isPending: loadingMetadata } = useAsync({
        promiseFn: firebaseClient.getMetadata,
        sheetId: match.params.sheetId
    });

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (
            metadata &&
            (items.length === 0 || currentType !== type) &&
            metadata[type]
        ) {
            const array = Object.keys(metadata[type]).map(key => ({
                value: key,
                ...metadata[type][key]
            }));
            array.sort((a, b) => a.position - b.position);
            setItems(array);
            setCurrentType(type);
        }
    }, [match.params.sheetId, items, type, currentType, metadata]);

    const onSave = async items => {
        const newItems = {};
        items.forEach(({ value, ...item }, index) => {
            newItems[value] = {
                ...item,
                position: index
            };
        });
        setLoading(true);
        await firebaseClient.setMetadata({
            sheetId: match.params.sheetId,
            type,
            items: newItems
        });
        history.push(`/sheet/${match.params.sheetId}`);
    };

    const onClose = () => history.push(`/sheet/${match.params.sheetId}`);

    if (error) {
        return <span className={css(styles.title)}>Error: {error}</span>;
    }

    return (
        <LoadingComponent loading={loadingMetadata || loading} fullScreen>
            <Column>
                <span className={css(styles.title)}>{title}</span>
                <span className={css(styles.subtitle)}>
                    Arrastre los elementos de la lista para ordenarlos.
                </span>
                <SortableListComponent
                    items={items}
                    onClose={onClose}
                    onSave={onSave}
                    type={type}
                    options={options}
                    title={title}
                />
            </Column>
        </LoadingComponent>
    );
}

export default ComboItemsComponent;
