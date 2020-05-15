import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import ReactPaginate from 'react-paginate';
import { Column, Row } from 'simple-flexbox';
import FlipMove from 'react-flip-move';
import { useSheetChangesSubscription } from '../../logic/useSheetChangesSubscription';
import ExpenseItem from './ExpenseItem';
import { numberFormat } from '../../logic/utilities';
import { LoadingComponent } from '../../commons/InitializingComponent';
import StatisticsWidget from './StatisticsWidget';
import StatisticsByCategoryWidget from './StatisticsByCategoryWidget';
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
            display: 'block',
            marginTop: 10
        }
    }
});

function ExpensesComponent() {
    const { history, match } = useReactRouter();
    const {
        expenses,
        loading,
        sheetName,
        statistics,
        tags
    } = useSheetChangesSubscription(match.params.sheetId);
    const [expensesFiltered, setExpensesFiltered] = useState([]);

    useEffect(() => setExpensesFiltered([...expenses].splice(0, 10)), [
        expenses
    ]);

    const onAddSheetClick = () =>
        history.push(`/sheet/${match.params.sheetId}/new`);

    const onExpenseClick = expenseId =>
        history.push(`/sheet/${match.params.sheetId}/edit/${expenseId}`);

    useEffect(() => window.scrollTo(0, 0), []);

    const handlePageClick = ({ selected }) => {
        setExpensesFiltered([...expenses].splice(selected * 10, 10));
    };

    const isMobile = () => window.innerWidth <= 1080;

    const periodos = [];
    let totalDays = 0;
    if (statistics) {
        Object.keys(statistics).forEach(p => {
            if (typeof statistics[p] === 'object' && p !== 'categories') {
                periodos.push({
                    ...statistics[p],
                    periodo: p
                });
            }
        });

        var diffTime = Math.abs(statistics.lastUpdate - statistics.minDate);
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    return (
        <LoadingComponent loading={loading} fullScreen>
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
                                / día. {totalDays} días.
                            </Row>
                        </Row>

                        <FlipMove>
                            {(expensesFiltered || []).map(e => (
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
                        {statistics.categories && (
                            <StatisticsByCategoryWidget
                                categories={statistics.categories}
                                showBorders
                            />
                        )}
                    </Column>
                </Row>
            </Column>
        </LoadingComponent>
    );
}

ExpensesComponent.whyDidYouRender = false;

export default ExpensesComponent;
