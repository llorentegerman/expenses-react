import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import FlipMove from 'react-flip-move';
import Modal from 'react-modal';
import { useSheetChangesSubscription } from '../../logic/useSheetChangesSubscription';
import ExpenseItem from './ExpenseItem';
import { applyFilters, numberFormat } from '../../logic/utilities';
import { LoadingComponent, PaginationComponent } from '../../components';
import StatisticsWidget from './StatisticsWidget';
import StatisticsByCategoryWidget from './StatisticsByCategoryWidget';
import FiltersComponent from './FiltersComponent';

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
    link: {
        color: '#2c689c',
        cursor: 'pointer',
        fontSize: 14,
        textDecoration: 'underline'
    },
    statisticsGlobal: {
        border: '1px solid #fa7159',
        borderRadius: 5,
        fontWeight: 600,
        padding: '8px 10px',
        textAlign: 'center'
    },
    sideColumnsLeft: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 240,
        minWidth: 80,
        '@media (max-width: 1080px)': {
            maxWidth: 880
        }
    },
    sideColumnsRight: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 240,
        minWidth: 220,
        paddingTop: 56,
        paddingLeft: 10,
        '@media (max-width: 1080px)': {
            padding: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            maxWidth: 880,
            marginTop: 20
        }
    },
    showFiltersButton: {
        backgroundColor: '#2c689c',
        borderRadius: 5,
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600,
        padding: '8px 10px',
        textAlign: 'center',
        margin: '0px 8px',
        ':hover': {
            backgroundColor: '#2c689c'
        },
        '@media (max-width: 768px)': {
            marginTop: 10,
            marginLeft: 0
        }
    }
});

function ExpensesComponent() {
    const { history, match } = useReactRouter();
    const { expenses, loading, statistics, tags } = useSheetChangesSubscription(
        match.params.sheetId
    );
    const [expensesFiltered, setExpensesFiltered] = useState([]);
    const [expensesPaginated, setExpensesPaginated] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({});

    useEffect(() => {
        const filtered = applyFilters([...expenses], currentFilters);
        setExpensesFiltered(filtered);
        setExpensesPaginated([...filtered].splice(0, 10));
    }, [expenses, currentFilters]);

    const onAddSheetClick = () =>
        history.push(`/sheet/${match.params.sheetId}/new`);

    const onExpenseClick = expenseId =>
        history.push(`/sheet/${match.params.sheetId}/edit/${expenseId}`);

    useEffect(() => window.scrollTo(0, 0), []);

    const handlePageClick = ({ selected }) => {
        setExpensesPaginated([...expensesFiltered].splice(selected * 10, 10));
    };

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

    const hasFilters = Object.keys(currentFilters).length > 0;
    const pageCount = expensesFiltered.length / 10;

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
                    <span className={css(styles.sideColumnsLeft)}></span>

                    <Column
                        style={{ maxWidth: 880, width: '100%' }}
                        breakpoints={{
                            1080: { padding: '0px 10px', maxWidth: 880 }
                        }}
                    >
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
                                Add Expense
                            </span>
                            <Row
                                breakpoints={{
                                    768: {
                                        flexDirection: 'column',
                                        alignItems: 'flex-start'
                                    }
                                }}
                            >
                                <Row
                                    vertical="end"
                                    breakpoints={{
                                        768: {
                                            flexDirection: 'row-reverse'
                                        }
                                    }}
                                >
                                    {hasFilters && (
                                        <span
                                            className={css(styles.link)}
                                            onClick={() =>
                                                setCurrentFilters({})
                                            }
                                        >
                                            clear filters
                                        </span>
                                    )}
                                    <span
                                        className={css(
                                            styles.showFiltersButton
                                        )}
                                        onClick={() => setShowFilters(true)}
                                    >
                                        Filters
                                    </span>
                                </Row>
                                <Row
                                    className={css(styles.statisticsGlobal)}
                                    breakpoints={{ 768: { marginTop: 10 } }}
                                >
                                    Overall Average: $
                                    {numberFormat(
                                        Math.round(statistics.average || 0),
                                        0
                                    )}{' '}
                                    / day. {totalDays} days.
                                </Row>
                            </Row>
                        </Row>

                        <FlipMove>
                            {(expensesPaginated || []).map(e => (
                                <ExpenseItem
                                    key={e.id}
                                    expense={e}
                                    onEditClick={onExpenseClick}
                                    tags={tags || []}
                                />
                            ))}
                        </FlipMove>

                        <PaginationComponent
                            pageCount={pageCount}
                            onPageChange={handlePageClick}
                        />
                    </Column>
                    <Column className={css(styles.sideColumnsRight)}>
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
            <Modal
                isOpen={showFilters}
                onRequestClose={() => setShowFilters(false)}
                style={{
                    content: {
                        border: '1px solid #2c689c',
                        borderRadius: 4,
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: 20,
                        zIndex: 1102
                    },
                    overlay: {
                        backgroundColor: 'rgba(10, 10, 10, .3)',
                        zIndex: 1101
                    }
                }}
                ariaHideApp={false}
            >
                <FiltersComponent
                    filters={currentFilters}
                    onApply={filters => {
                        setCurrentFilters(filters);
                        setShowFilters(false);
                    }}
                    onClose={() => setShowFilters(false)}
                />
            </Modal>
        </LoadingComponent>
    );
}

ExpensesComponent.whyDidYouRender = false;

export default ExpensesComponent;
