import React, { useEffect } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import { useExpenses } from '../../commons/useExpenses';
import IconPlus from '../../assets/icon-plus.js';

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#FDFDFD',
        border: '1px solid #E7EBF0',
        borderRadius: 4,
        color: '#172b4d',
        cursor: 'pointer',
        marginBottom: 10,
        minHeight: 80,
        padding: '10px 20px',
        '@media (max-width: 488px)': {
            padding: '5px 10px'
        },
        flexGrow: 1,
        marginRight: 10,
        minWidth: 300,
        '@media (max-width: 380px)': {
            minWidth: 250
        }
    },
    itemPlusContainer: {
        border: '3px dashed #9C9B9B',
        borderRadius: 4,
        color: '#9C9B9B',
        cursor: 'pointer',
        marginBottom: 10,
        minHeight: 80,
        flexGrow: 1,
        marginRight: 10,
        padding: '10px 20px',
        '@media (max-width: 488px)': {
            padding: '5px 10px'
        },
        ':hover': {
            borderColor: '#6C6B6B',
            color: '#6C6B6B',
            ':nth-child(n) > svg > path': {
                fill: '#6C6B6B'
            }
        },
        ':nth-child(n) > svg > path': {
            fill: '#9C9B9B'
        },
        minWidth: 300,
        '@media (max-width: 380px)': {
            minWidth: 200
        }
    }
});

function ExpensesComponent() {
    const { history } = useReactRouter();
    const { initializing, user } = useExpenses();

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        if (!initializing && !user) {
            return history.push('/login');
        }
    }, [history, initializing, user]);

    if (!user) {
        return <div></div>;
    }

    const onAddSheetClick = () => history.push('/newsheet');

    const onSheetClick = id => history.push(`/sheet/${id}`);

    const pairs = [];
    const sheets = Object.keys(user.sheets || [])
        .map((value, index) => {
            const sheet = user.sheets[value];
            const metadata = sheet.metadata || {};
            return {
                position:
                    metadata.position !== undefined ? metadata.position : index,
                show: metadata.show !== undefined ? metadata.show : true,
                id: sheet.id
            };
        })
        .sort((a, b) => a.position - b.position);

    sheets
        .filter(s => s.show)
        .forEach((sheet, index) => {
            const pairIndex = Math.floor(index / 2);
            if (index % 2 === 0 && pairs.length <= pairIndex) {
                pairs.push([]);
            }
            return pairs[pairIndex].push(user.sheets[sheet.id]);
        });

    if (pairs.length > 0 && pairs[pairs.length - 1].length === 1) {
        pairs[pairs.length - 1].push({ plus: true });
    } else {
        pairs.push([{ plus: true }]);
    }

    return (
        <Column horizontal="center">
            <Column
                style={{ maxWidth: 800, width: '100%', padding: '10px 10px' }}
            >
                {pairs.map((p, i) => (
                    <Row
                        key={`pair-${i}`}
                        horizontal="space-between"
                        style={{ marginRight: -10 }}
                        wrap
                    >
                        {p.map((item, i) =>
                            item.plus ? (
                                <Row
                                    key="key-add-sheet"
                                    vertical="center"
                                    horizontal="center"
                                    className={css(styles.itemPlusContainer)}
                                    onClick={onAddSheetClick}
                                >
                                    <IconPlus width={16} fill="" />
                                    <span style={{ marginLeft: 10 }}>
                                        Add Sheet
                                    </span>
                                </Row>
                            ) : (
                                <Row
                                    key={`sheet-${i}`}
                                    onClick={() => onSheetClick(item.id)}
                                    className={css(styles.itemContainer)}
                                    horizontal="center"
                                    vertical="center"
                                >
                                    {item.name}
                                </Row>
                            )
                        )}
                    </Row>
                ))}
            </Column>
        </Column>
    );
}

export default ExpensesComponent;
