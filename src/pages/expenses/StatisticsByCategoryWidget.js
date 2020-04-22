import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import { numberFormat } from '../../logic/utilities';

const styles = StyleSheet.create({
    statistics: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: 5,
        padding: '8px 10px',
        textAlign: 'left',
        marginTop: 10,
        ':first-child': {
            marginTop: 0
        },
        '@media (max-width: 1080px)': {
            minWidth: 180,
            marginTop: 10,
            marginLeft: 4,
            flexGrow: 1,
            ':first-child': {
                marginTop: 10,
                marginLeft: 4
            }
        }
    },
    categoryStatistics: {
        marginTop: 10,
        ':first-child': {
            marginTop: 0
        },
        '@media (max-width: 1080px)': {
            minWidth: 150,
            marginTop: 5,
            marginBottom: 5,
            ':first-child': {
                marginTop: 5,
                marginBottom: 5
            }
        }
    }
});

function StatisticsByCategoryWidget({ categories }) {
    return (
        <Row
            horizontal="spaced"
            className={css(styles.statistics)}
            style={{
                borderColor: '#17183B'
            }}
            wrap
        >
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
                        <span>Total: ${numberFormat(statistics.total, 0)}</span>
                    </Column>
                );
            })}
        </Row>
    );
}

StatisticsByCategoryWidget.whyDidYouRender = false;

export default StatisticsByCategoryWidget;
