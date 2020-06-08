import React, { useEffect, useState } from 'react';
import {
    sortableContainer,
    sortableElement,
    sortableHandle
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import Switch from 'react-switch';
import { ColorPickerComponent } from '../../components';
import IconStar from '../../assets/icon-star';
import IconStarFilled from '../../assets/icon-star-filled';
import IconRemove from '../../assets/icon-remove';
import IconEdit from '../../assets/icon-edit';

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
        options
    }) => (
        <Column className={css(styles.item)}>
            <Row vertical="center" horizontal="spaced">
                <DragHandle>
                    <Row vertical="center" className={css(styles.itemValue)}>
                        {position + 1} - {value.value}
                    </Row>
                </DragHandle>
                <Row vertical="center">
                    {options.showEditButton && (
                        <div
                            style={{ cursor: 'pointer', marginRight: 10 }}
                            onClick={onEditClick}
                        >
                            <IconEdit width={24} />
                        </div>
                    )}
                    {options.showShowButton && (
                        <div
                            style={{ cursor: 'pointer', marginRight: 10 }}
                            onClick={() => {}}
                        >
                            <Switch
                                onChange={() => {
                                    const newItem = {
                                        ...value,
                                        show: !value.show
                                    };
                                    onChange(newItem);
                                }}
                                checked={value.show}
                            />
                        </div>
                    )}
                    {!options.hideStar && (
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={onDefaultClick}
                        >
                            {value.default ? (
                                <IconStarFilled width={28} fill="#2c689c" />
                            ) : (
                                <IconStar width={28} />
                            )}
                        </div>
                    )}

                    {!options.hideRemove && (
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
                    )}
                </Row>
            </Row>
            {showEdit && (
                <table style={{ maxWidth: 200 }}>
                    <tbody>
                        {options.fields.map((f, i) => (
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

function SortableListComponent({
    type,
    items: props_items,
    onClose,
    onSave,
    options = {}
}) {
    const [showEditItem, setShowEditItem] = useState('');
    const [items, setItems] = useState(props_items || []);

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => setItems(props_items), [props_items]);

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
        <Column>
            <SortableContainer
                onSortEnd={onSortEnd}
                useDragHandle
                pressDelay={200}
                pressThreshold={10}
            >
                {items.map((item, index) => {
                    return (
                        <SortableItem
                            type={type}
                            key={`item-${index}-${item.value.value}`}
                            index={index}
                            value={item}
                            position={
                                item.position !== undefined
                                    ? item.position
                                    : index
                            }
                            onDeleteClick={() => onDeleteClick(index)}
                            onDefaultClick={() => onDefaultClick(index)}
                            onEditClick={() =>
                                showEditItem === item.value
                                    ? setShowEditItem('')
                                    : setShowEditItem(item.value)
                            }
                            showEdit={showEditItem === item.value}
                            onChange={newItem => onChangeItem(index, newItem)}
                            options={options}
                        />
                    );
                })}
            </SortableContainer>
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
                    onClick={() => onSave(items)}
                >
                    Save
                </span>
            </Row>
        </Column>
    );
}

export default SortableListComponent;
