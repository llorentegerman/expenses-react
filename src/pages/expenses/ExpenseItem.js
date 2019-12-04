import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Column, Row } from 'simple-flexbox';
import moment from 'moment';
import { numberFormat } from '../../commons/utilities';
import IconCalendar from '../../assets/icon-calendar';
import IconLocation from '../../assets/icon-location';

const styles = StyleSheet.create({
    amount: {
        whiteSpace: 'nowrap',
        fontSize: 27,
        lineHeight: '27px',
        fontWeight: 600
    },
    category: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: '21px',
        whiteSpace: 'nowrap'
    },
    container: {
        backgroundColor: '#FDFDFD',
        border: '1px solid #E7EBF0',
        borderRadius: 4,
        color: '#172b4d',
        marginBottom: 10,
        minHeight: 80,
        padding: '10px 20px',
        '@media (max-width: 488px)': {
            padding: '5px 10px'
        }
    },
    currency: {
        fontSize: 10,
        marginBottom: 2,
        marginLeft: 2
    },
    editButton: {
        backgroundColor: '#FFFFFF',
        border: '1px solid rgb(35, 112, 163)',
        borderRadius: 5,
        color: 'rgb(35, 112, 163)',
        cursor: 'pointer',
        fontWeight: 500,
        padding: '2px 8px',
        textAlign: 'center',
        ':hover': {
            backgroundColor: '#FCFCFC'
        }
    },
    lastColumn: {
        maxWidth: 300,
        minWidth: 10,
        '@media (max-width: 654px)': {
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            marginTop: 10,
            width: '100%',
            maxWidth: 'none'
        }
    },
    method: {
        fontSize: 18,
        marginTop: 10
    },
    tag: {
        borderRadius: 5,
        fontWeight: 600,
        padding: '8px 8px',
        textAlign: 'center',
        marginTop: 4,
        marginRight: 4
    }
});

class ExpensesComponent extends React.PureComponent {
    render() {
        const { expense, tags } = this.props;
        return (
            <Column className={css(styles.container)}>
                <Row horizontal="spaced" breakpoints={{ 654: 'column' }}>
                    <Row flexGrow={3}>
                        <Column
                            flexGrow={1}
                            vertical="spaced"
                            style={{ maxWidth: 300, minWidth: 300 }}
                            breakpoints={{
                                744: { minWidth: 200 },
                                488: { minWidth: 150, maxWidth: 150 },
                                360: { minWidth: 120, maxWidth: 120 }
                            }}
                        >
                            <Row nowrap={'true'} vertical="end">
                                <Row className={css(styles.amount)}>
                                    $ {numberFormat(expense.amount, 0)}
                                </Row>
                                <span className={css(styles.currency)}>
                                    / {expense.currency}
                                </span>
                            </Row>
                            <Row
                                style={{ marginTop: 10 }}
                                nowrap={'true'}
                                vertical="center"
                            >
                                <IconCalendar width={22} />
                                <span style={{ marginLeft: 4 }}>
                                    {moment(+expense.date).format('DD/MM/YYYY')}
                                </span>
                            </Row>
                            <Row
                                style={{ marginTop: 10 }}
                                nowrap={'true'}
                                vertical="center"
                            >
                                <IconLocation width={22} />
                                <span style={{ marginLeft: 4 }}>
                                    {expense.city}
                                </span>
                            </Row>
                        </Column>
                        <Column
                            flexGrow={1}
                            vertical="spaced"
                            breakpoints={{
                                744: { minWidth: 200 },
                                488: { marginTop: 10, minWidth: 0 },
                                340: { marginLeft: 4 }
                            }}
                        >
                            <Column>
                                <span className={css(styles.category)}>
                                    {expense.category}
                                </span>
                                <span style={{ marginTop: 4, fontSize: 12 }}>
                                    {expense.description}
                                </span>
                            </Column>
                            <span className={css(styles.method)}>
                                {expense.method}
                            </span>
                        </Column>
                    </Row>
                    <Column
                        className={css(styles.lastColumn)}
                        flexGrow={1}
                        horizontal="end"
                        vertical="spaced"
                    >
                        <span
                            onClick={() => this.props.onEditClick(expense.id)}
                            className={css(styles.editButton)}
                        >
                            EDIT
                        </span>
                        <Row
                            wrap
                            horizontal="end"
                            breakpoints={{
                                654: { justifyContent: 'flex-start' }
                            }}
                        >
                            {expense.tags &&
                                expense.tags.length > 0 &&
                                expense.tags.split(',').map((t, i) => (
                                    <span
                                        key={`${i}-${t}`}
                                        className={css(styles.tag)}
                                        style={{
                                            backgroundColor:
                                                (tags[t] &&
                                                    tags[t].backgroundColor) ||
                                                '#38bcfb',
                                            color:
                                                (tags[t] && tags[t].color) ||
                                                'white'
                                        }}
                                    >
                                        {t.trim()}
                                    </span>
                                ))}
                        </Row>
                    </Column>
                </Row>
            </Column>
        );
    }
}

export default ExpensesComponent;
