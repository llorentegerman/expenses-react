import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { Column, Row } from 'simple-flexbox';
import FlipMove from 'react-flip-move';
import Modal from 'react-modal';
import { useSheetChangesSubscription } from '../../logic/useSheetChangesSubscription';
import {
    applyFilters,
    calculateStatistics,
    daysDiff,
    getPeriods,
    numberFormat
} from '../../logic/utilities';
import {
    ButtonComponent,
    LoadingComponent,
    PaginationComponent,
    StatisticsByCategoryWidget,
    StatisticsWidget
} from '../../components';
import ExpenseItem from './ExpenseItem';
import FiltersComponent from './FiltersComponent';

const styles = StyleSheet.create({
    buttonsContainer: {
        marginTop: 10,
        marginBottom: 10
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
        margin: '0px 8px',
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

    useEffect(() => window.scrollTo(0, 0), []);

    const onAddSheetClick = () =>
        history.push(`/sheet/${match.params.sheetId}/new`);

    const onExpenseClick = expenseId =>
        history.push(`/sheet/${match.params.sheetId}/edit/${expenseId}`);

    const handlePageClick = ({ selected }) => {
        setExpensesPaginated([...expensesFiltered].splice(selected * 10, 10));
    };

    const getAverageLabel = () => {
        if (!statistics) {
            return '';
        }
        const totalDays = daysDiff(statistics.lastUpdate, statistics.minDate);

        return `Overall Average: $${numberFormat(
            Math.round(statistics.average || 0),
            0
        )} / day. ${totalDays} days.`;
    };

    const periods = getPeriods(statistics);
    const hasFilters = Object.keys(currentFilters).length > 0;
    const pageCount = expensesFiltered.length / 10;

    return (
        <LoadingComponent loading={loading} fullScreen>
            <Column horizontal="center">
                <Row
                    style={{ width: '100%' }}
                    horizontal="spaced"
                    breakpoints={{
                        1080: { flexDirection: 'column', alignItems: 'center' } // prettier-ignore
                    }}
                >
                    <span className={css(styles.sideColumnsLeft)}></span>

                    <Column
                        style={{ maxWidth: 880, width: '100%' }}
                        breakpoints={{ 1080: { padding: '0px 10px', maxWidth: 880 } }} // prettier-ignore
                    >
                        <Row
                            className={css(styles.buttonsContainer)}
                            vertical="center"
                            horizontal="spaced"
                            breakpoints={{
                                768: { flexDirection: 'column', alignItems: 'flex-start' } // prettier-ignore
                            }}
                        >
                            <ButtonComponent
                                color="green"
                                label="Add Expense"
                                onClick={onAddSheetClick}
                            />
                            <Row
                                breakpoints={{
                                    768: { flexDirection: 'column', alignItems: 'flex-start' } // prettier-ignore
                                }}
                            >
                                <Row
                                    vertical="end"
                                    breakpoints={{ 768: { flexDirection: 'row-reverse' } }} // prettier-ignore
                                >
                                    {hasFilters && (
                                        <span
                                            className={css(styles.link)}
                                            onClick={() => setCurrentFilters({})} // prettier-ignore
                                        >
                                            clear filters
                                        </span>
                                    )}
                                    <ButtonComponent
                                        className={css(
                                            styles.showFiltersButton
                                        )}
                                        color="blue"
                                        label="Filters"
                                        onClick={() => setShowFilters(true)}
                                    />
                                </Row>
                                {!hasFilters && (
                                    <Row
                                        className={css(styles.statisticsGlobal)}
                                        breakpoints={{ 768: { marginTop: 10 } }}
                                    >
                                        {getAverageLabel()}
                                    </Row>
                                )}
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
                        {hasFilters && (
                            <StatisticsWidget
                                hideForecast
                                statistics={calculateStatistics(
                                    expensesFiltered
                                )}
                                index={3}
                            />
                        )}
                        {periods
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
