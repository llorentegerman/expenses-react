import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';
import { getDaysInPeriod, numberFormat } from '../../logic/utilities';
import StatisticsByCategoryWidget from './StatisticsByCategoryWidget';

const styles = StyleSheet.create({
    statistics: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: 5,
        padding: '8px 10px',
        textAlign: 'center',
        marginTop: 10,
        ':first-child': {
            marginTop: 0
        },
        '@media (max-width: 1080px)': {
            minWidth: 180,
            marginTop: 10,
            marginLeft: 4,
            ':first-child': {
                marginTop: 10,
                marginLeft: 4
            }
        }
    }
});

const borderColors = [
    '#731DD8',
    '#48A9A6',
    '#D4B483',
    '#C1666B',
    '#605B56',
    '#ACC18A',
    '#DAFEB7',
    '#C96480',
    '#B47978',
    '#95BF8F'
];

function StatisticsWidget({ index, statistics }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <React.Fragment>
            <Column
                horizontal="start"
                key={`statistics-${statistics.periodo}`}
                className={css(styles.statistics)}
                style={{
                    borderColor: borderColors[index % borderColors.length]
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <span style={{ fontWeight: 600 }}>{statistics.periodo}</span>
                <span>
                    Promedio: $
                    {numberFormat(Math.round(statistics.average || 0), 0)} / día
                </span>
                <span>Total: ${numberFormat(statistics.total, 0)}</span>
                <span>Días: {statistics.days}</span>
                <span>
                    Proyección: $
                    {numberFormat(
                        Math.round(
                            getDaysInPeriod(statistics.periodo) *
                                (statistics.average || 0)
                        ),
                        0
                    )}
                </span>
            </Column>
            {expanded && statistics.categories && (
                <StatisticsByCategoryWidget
                    categories={statistics.categories}
                    onClick={() => setExpanded(false)}
                    title={statistics.periodo}
                />
            )}
        </React.Fragment>
    );
}

StatisticsWidget.whyDidYouRender = false;

export default StatisticsWidget;
