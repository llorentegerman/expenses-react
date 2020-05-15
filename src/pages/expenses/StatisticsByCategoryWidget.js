import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { numberFormat } from '../../logic/utilities';

const styles = StyleSheet.create({
    border: {
        borderColor: '#17183B',
        borderRadius: 5,
        borderStyle: 'solid',
        borderWidth: '1px',
        marginTop: 10,
        padding: '8px 10px'
    },
    statistics: {
        textAlign: 'left',
        '@media (max-width: 1080px)': {
            flexGrow: 1,
            minWidth: 180
        }
    },
    categoryStatistics: {
        marginTop: 10,
        ':first-child': {
            marginTop: 0
        },
        '@media (max-width: 1080px)': {
            marginBottom: 5,
            marginTop: 5,
            minWidth: 150
        }
    }
});

function StatisticsByCategoryWidget({ categories, showBorders, onClick }) {
    return (
        <Column
            className={css(styles.statistics, showBorders && styles.border)}
            onClick={onClick}
        >
            <Row horizontal="spaced" wrap>
                {Object.keys(categories).map(category => {
                    const statistics = categories[category];
                    return (
                        <Column
                            key={`statistics-category-${category}`}
                            className={css(styles.categoryStatistics)}
                        >
                            <span style={{ fontWeight: 600 }}>{category}</span>
                            <span>
                                Promedio: $
                                {numberFormat(
                                    Math.round(statistics.average || 0),
                                    0
                                )}{' '}
                                / día
                            </span>
                            <span>
                                Total: ${numberFormat(statistics.total, 0)}
                            </span>
                        </Column>
                    );
                })}
            </Row>
        </Column>
    );
}

StatisticsByCategoryWidget.whyDidYouRender = false;

export default StatisticsByCategoryWidget;