import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import ReactPaginate from 'react-paginate';
import { Column, Row } from 'simple-flexbox';
import FlipMove from 'react-flip-move';
import { useExpenses } from '../../commons/useExpenses';
import ExpenseItem from './ExpenseItem';
import { numberFormat } from '../../commons/utilities';
import { LoadingComponent } from '../../commons/InitializingComponent';
import StatisticsWidget from './StatisticsWidget';
import '../../commons/styles/pagination.css';

const styles = StyleSheet.create({
    buttonsContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    addExpenseButton: {
        backgroundColor: 'green',
        borderRadius: 5,
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600,
        padding: '8px 10px',
        textAlign: 'center',
        ':hover': {
            backgroundColor: '#198c19'
        }
    },
    statisticsGlobal: {
        border: '1px solid #fa7159',
        borderRadius: 5,
        fontWeight: 600,
        padding: '8px 10px',
        textAlign: 'center'
    },
    sideColumns: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 240,
        minWidth: 220,
        '@media (max-width: 1080px)': {
            maxWidth: 880,
            marginTop: -10
        }
    },
    sheetName: {
        display: 'none',
        '@media (max-width: 1080px)': {
            display: 'block'
        }
    }
});

function ExpensesComponent() {
    const { history, match } = useReactRouter();
    const {
        formatData,
        user,
        logout,
        getSheet,
        getExpensesRef,
        getMetadataRef,
        loadings: { loading_getSheet }
    } = useExpenses();
    const [expenses, setExpenses] = useState([]);
    const [expensesFiltered, setExpensesFiltered] = useState([]);
    const [tags, setTags] = useState([]);
    const [statistics, setStatistics] = useState({});

    const onAddSheetClick = () =>
        history.push(`/sheet/${match.params.sheetId}/new`);

    const onExpenseClick = useCallback(
        expenseId =>
            history.push(`/sheet/${match.params.sheetId}/edit/${expenseId}`),
        [history, match.params.sheetId]
    );

    useEffect(() => window.scrollTo(0, 0), []);

    useEffect(() => {
        let isInitialFetch = true;
        let _rawData = [];
        let _metadata = {};

        const getSheetFetch = async sheetId => {
            const getSheetResponse = await getSheet(sheetId);
            setExpenses(getSheetResponse.expenses);
            setExpensesFiltered([...getSheetResponse.expenses].splice(0, 10));
            setStatistics(getSheetResponse.metadata.statistics);
            setTags(getSheetResponse.metadata.tags);
            _rawData = getSheetResponse.expensesRaw;
            _metadata = getSheetResponse.metadata;
            isInitialFetch = false;
        };
        if (match.params.sheetId && user) {
            const sheet = user.sheets[match.params.sheetId];
            if (!sheet) {
                logout();
            } else {
                const expensesRef = getExpensesRef(match.params.sheetId);
                const metadataRef = getMetadataRef(match.params.sheetId);
                expensesRef.on('child_added', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const array = [..._rawData, childSnapshot.val()];
                    _rawData = [...array];
                    const formatted = formatData(array);
                    setExpenses(formatted);
                    setExpensesFiltered(formatted.splice(0, 10));
                });

                expensesRef.on('child_changed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const dataIndex = _rawData.findIndex(
                        d => d.id === childSnapshot.key
                    );
                    const newRawData = [..._rawData];
                    newRawData[dataIndex] = childSnapshot.val();
                    _rawData = [...newRawData];
                    const formatted = formatData(newRawData);
                    setExpenses(formatted);
                    setExpensesFiltered(formatted.splice(0, 10));
                });

                expensesRef.on('child_removed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    const dataIndex = _rawData.findIndex(
                        d => d.id === childSnapshot.key
                    );
                    const newRawData = [..._rawData];
                    newRawData.splice(dataIndex, 1);
                    const formatted = formatData(newRawData);
                    setExpenses(formatted);
                    setExpensesFiltered(formatted.splice(0, 10));
                });

                metadataRef.on('child_added', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    _metadata[childSnapshot.key] = childSnapshot.val();
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                metadataRef.on('child_changed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    _metadata[childSnapshot.key] = childSnapshot.val();
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                metadataRef.on('child_removed', childSnapshot => {
                    if (isInitialFetch) {
                        return;
                    }
                    delete _metadata[childSnapshot.key];
                    setStatistics(_metadata.statistics);
                    setTags(_metadata.tags);
                });

                getSheetFetch(match.params.sheetId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.params.sheetId]);

    if (user && Object.keys(user.sheets).length === 0) {
        return (
            <Column vertical="center">
                <span onClick={onAddSheetClick}>CREAR SHEET</span>
            </Column>
        );
    }

    const handlePageClick = ({ selected }) => {
        setExpensesFiltered([...expenses].splice(selected * 10, 10));
    };

    const isMobile = () => window.innerWidth <= 1080;

    const periodos = [];
    if (statistics) {
        Object.keys(statistics).forEach(p => {
            if (typeof statistics[p] === 'object') {
                periodos.push({
                    ...statistics[p],
                    periodo: p
                });
            }
        });
    }

    const sheetName =
        user && user.sheets && user.sheets[match.params.sheetId].name;

    return (
        <LoadingComponent loading={loading_getSheet} fullScreen>
            <Column horizontal="center">
                <Row
                    style={{ width: '100%' }}
                    horizontal="spaced"
                    breakpoints={{
                        1080: {
                            flexDirection: 'column',
                            alignItems: 'center'
                        }
                    }}
                >
                    <span className={css(styles.sideColumns)}></span>

                    <Column
                        style={{ maxWidth: 880, width: '100%' }}
                        breakpoints={{
                            1080: { padding: '0px 10px', maxWidth: 880 }
                        }}
                    >
                        <span className={css(styles.sheetName)}>
                            {sheetName}
                        </span>

                        <Row
                            className={css(styles.buttonsContainer)}
                            vertical="center"
                            horizontal="spaced"
                            breakpoints={{
                                768: {
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }
                            }}
                        >
                            <span
                                className={css(styles.addExpenseButton)}
                                onClick={onAddSheetClick}
                            >
                                Nuevo Gasto
                            </span>
                            <Row
                                className={css(styles.statisticsGlobal)}
                                breakpoints={{ 768: { marginTop: 4 } }}
                            >
                                Promedio Global: $
                                {numberFormat(
                                    Math.round(statistics.average || 0),
                                    0
                                )}{' '}
                                / día
                            </Row>
                        </Row>

                        <FlipMove>
                            {(expensesFiltered || []).map((e, i) => (
                                <ExpenseItem
                                    key={e.id}
                                    expense={e}
                                    onEditClick={onExpenseClick}
                                    tags={tags || []}
                                />
                            ))}
                        </FlipMove>

                        <ReactPaginate
                            previousLabel={'<'}
                            nextLabel={'>'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={expenses.length / 10}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={isMobile() ? 2 : 5}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            subContainerClassName={'pages pagination'}
                            activeClassName={'active'}
                        />
                    </Column>
                    <Column
                        className={css(styles.sideColumns)}
                        style={{ paddingTop: 56, paddingLeft: 10 }}
                        breakpoints={{
                            1080: {
                                padding: 0,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between'
                            }
                        }}
                    >
                        {periodos
                            .slice(0)
                            .reverse()
                            .map((p, index) => {
                                return (
                                    <StatisticsWidget
                                        key={`statistics-${index}`}
                                        statistics={p}
                                        index={index}
                                    />
                                );
                            })}
                    </Column>
                </Row>
            </Column>
        </LoadingComponent>
    );
}

ExpensesComponent.whyDidYouRender = false;

export default ExpensesComponent;
