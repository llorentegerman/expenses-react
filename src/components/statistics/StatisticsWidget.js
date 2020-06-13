import React, { useState } from 'react';
import { bool, number, object, shape, string } from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import { Column } from 'simple-flexbox';
import CollapsibleContent from 'react-collapsible-content';
import { getDaysInPeriod, numberFormat } from '../../logic/utilities';
import StatisticsByCategoryWidget from './StatisticsByCategoryWidget';

const styles = StyleSheet.create({
    statistics: {
        borderRadius: 5,
        borderStyle: 'solid',
        borderWidth: '1px',
        height: 'auto',
        padding: '8px 10px',
        marginTop: 10,
        overflow: 'hidden',
        textAlign: 'center',
        ':first-child': {
            marginTop: 0
        },
        '@media (max-width: 1080px)': {
            flexGrow: 1,
            marginTop: 10,
            minWidth: 180
        }
    },
    toggleButton: {
        cursor: 'pointer',
        fontSize: 24,
        fontWeight: 600,
        position: 'absolute',
        transitionProperty: 'opacity',
        transitionDuration: '.25s',
        transitionTimingFunction: 'ease-in-out'
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

function StatisticsWidget({ index, statistics, hideForecast }) {
    const [expanded, setExpanded] = useState(false);

    const renderToggleButton = isExpand => (
        <span
            className={css(styles.toggleButton)}
            onClick={() => setExpanded(prevValue => !prevValue)}
            style={{
                top: hideForecast ? -80 : -95,
                right: 0,
                opacity: isExpand ? (expanded ? 0 : 1) : expanded ? 1 : 0
            }}
        >
            {isExpand ? '+' : '-'}
        </span>
    );

    return (
        <Column
            horizontal="start"
            className={css(styles.statistics)}
            style={{
                borderColor: borderColors[index % borderColors.length]
            }}
        >
            <span style={{ fontWeight: 600 }}>{statistics.periodo}</span>
            <span>
                Average: ${numberFormat(Math.round(statistics.average || 0), 0)}{' '}
                / day
            </span>
            <span>Total: ${numberFormat(statistics.total, 0)}</span>
            <span>Days: {statistics.days}</span>
            {!hideForecast && (
                <span>
                    Forecast: $
                    {numberFormat(
                        Math.round(
                            getDaysInPeriod(statistics.periodo) *
                                (statistics.average || 0)
                        ),
                        0
                    )}
                </span>
            )}

            {statistics.categories && (
                <React.Fragment>
                    <div style={{ position: 'relative', width: '100%' }}>
                        {renderToggleButton(true)}
                        {renderToggleButton(false)}
                    </div>
                    <CollapsibleContent expanded={expanded}>
                        <div style={{ marginTop: 10 }}>
                            <StatisticsByCategoryWidget
                                categories={statistics.categories}
                            />
                        </div>
                    </CollapsibleContent>
                </React.Fragment>
            )}
        </Column>
    );
}

StatisticsWidget.propTypes = {
    index: number,
    statistics: shape({
        average: number,
        categories: object,
        days: number,
        periodo: string,
        total: number
    }),
    hideForecast: bool
};

export default StatisticsWidget;
