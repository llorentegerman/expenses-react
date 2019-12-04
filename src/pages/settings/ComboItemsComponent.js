import React, { useEffect, useState } from 'react';
import {
    sortableContainer,
    sortableElement,
    sortableHandle
} from 'react-sortable-hoc';
import useReactRouter from 'use-react-router';
import arrayMove from 'array-move';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { useExpenses } from '../../commons/useExpenses';
import { LoadingComponent } from '../../commons/InitializingComponent';
import ColorPickerComponent from '../../commons/ColorPickerComponent';
import IconStar from '../../assets/icon-star';
import IconStarFilled from '../../assets/icon-star-filled';
import IconRemove from '../../assets/icon-remove';
import IconEdit from '../../assets/icon-edit';

const types = {
    categories: {},
    cities: {},
    currencies: {},
    methods: {},
    tags: {
        showEditButton: true,
        fields: [
            { name: 'backgroundColor', title: 'Fondo', type: 'color' },
            { name: 'color', title: 'Color', type: 'color' }
        ]
    }
};

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
    container: {},
    item: {
        borderRadius: 4,
        backgroundColor: '#FDFDFD',
        border: '1px solid #E7EBF0',
        marginTop: 2,
        padding: '4px 8px'
    },
    itemValue: {
        '-webkit-user-select': 'none',
        flexGrow: 1,
        height: '100%',
        padding: '4px 8px'
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

const DragHandle = sortableHandle(({ children }) => children);

const SortableItem = sortableElement(
    ({
        position,
        value,
        onDeleteClick,
        onDefaultClick,
        showEdit,
        onEditClick,
        onChange,
        type
    }) => (
        <Column className={css(styles.item)}>
            <Row vertical="center" horizontal="spaced">
                <DragHandle>
                    <Row vertical="center" className={css(styles.itemValue)}>
                        {position + 1} - {value.value}
                    </Row>
                </DragHandle>
                <Row vertical="center">
                    {types[type].showEditButton && (
                        <div
                            style={{ cursor: 'pointer', marginRight: 10 }}
                            onClick={onEditClick}
                        >
                            <IconEdit width={24} />
                        </div>
                    )}

                    <div style={{ cursor: 'pointer' }} onClick={onDefaultClick}>
                        {value.default ? (
                            <IconStarFilled width={28} fill="#2c689c" />
                        ) : (
                            <IconStar width={28} />
                        )}
                    </div>

                    <div
                        style={{
                            cursor: 'pointer',
                            marginLeft: 16,
                            marginRight: 12
                        }}
                        onClick={onDeleteClick}
                    >
                        <IconRemove width={28} />
                    </div>
                </Row>
            </Row>
            {showEdit && (
                <table style={{ maxWidth: 200 }}>
                    <tbody>
                        {types[type].fields.map((f, i) => (
                            <tr key={`input-${f.name}`}>
                                <td>
                                    <span className={css(styles.label)}>
                                        {f.title}:
                                    </span>
                                </td>
                                <td>
                                    {f.type === 'color' ? (
                                        <ColorPickerComponent
                                            defaultColor={value[f.name]}
                                            onChangeComplete={color => {
                                                const newItem = { ...value };
                                                newItem[f.name] = color;
                                                onChange(newItem);
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            defaultValue={value[f.name]}
                                            onBlur={e => {
                                                const newItem = { ...value };
                                                newItem[f.name] =
                                                    e.target.value;
                                                onChange(newItem);
                                            }}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Column>
    )
);

const SortableContainer = sortableContainer(({ children }) => {
    return <Column className={css(styles.container)}>{children}</Column>;
});

function ComboItemsComponent({ title, type }) {
    const { history, match } = useReactRouter();
    const {
        getSheet,
        logout,
        setMetadata,
        user,
        loadings: { loading_getSheet, loading_setSection }
    } = useExpenses();

    const [metadata, setMetadataLocal] = useState([]);
    const [items, setItems] = useState([]);
    const [currentType, setCurrentType] = useState([]);
    const [showEditItem, setShowEditItem] = useState('');

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        const getSheetFetch = async sheetId => {
            const getSheetResponse = await getSheet(sheetId, { page: 0 });
            setMetadataLocal(getSheetResponse.metadata);
        };
        if (match.params.sheetId && user) {
            const sheet = user.sheets[match.params.sheetId];
            if (!sheet) {
                logout();
            } else {
                getSheetFetch(match.params.sheetId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.params.sheetId]);

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

    const onSave = async () => {
        const newItems = {};
        items.forEach(({ value, ...item }, index) => {
            newItems[value] = {
                ...item,
                position: index
            };
        });

        await setMetadata(match.params.sheetId, type, newItems);
        history.push(`/sheet/${match.params.sheetId}`);
    };

    const onClose = () => history.push(`/sheet/${match.params.sheetId}`);

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setItems(arrayMove(items, oldIndex, newIndex));
    };

    const onDeleteClick = index => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const onDefaultClick = index =>
        setItems(
            items.map((v, i) => ({
                ...v,
                default: i === index ? !items[index].default : false
            }))
        );

    const onChangeItem = (index, newItem) =>
        setItems(items.map((v, i) => (i === index ? newItem : v)));

    return (
        <LoadingComponent loading={loading_getSheet || loading_setSection}>
            <Column>
                <span className={css(styles.title)}>{title}</span>
                <span className={css(styles.subtitle)}>
                    Arrastre los elementos de la lista para ordenarlos.
                </span>
                <SortableContainer
                    onSortEnd={onSortEnd}
                    useDragHandle
                    pressDelay={200}
                    pressThreshold={10}
                >
                    {items.map((item, index) => (
                        <SortableItem
                            type={type}
                            key={`item-${index}-${item.value.value}`}
                            index={index}
                            value={item}
                            position={index}
                            onDeleteClick={() => onDeleteClick(index)}
                            onDefaultClick={() => onDefaultClick(index)}
                            onEditClick={() =>
                                showEditItem === item.value
                                    ? setShowEditItem('')
                                    : setShowEditItem(item.value)
                            }
                            showEdit={showEditItem === item.value}
                            onChange={newItem => onChangeItem(index, newItem)}
                        />
                    ))}
                </SortableContainer>
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
                        onClick={onSave}
                    >
                        Guardar
                    </span>
                </Row>
            </Column>
        </LoadingComponent>
    );
}

export default ComboItemsComponent;
