import React, { useEffect } from 'react';
import { string } from 'prop-types';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { useExpenses } from '../useExpenses';
import IconSearch from '../../assets/icon-search';
import IconBellNew from '../../assets/icon-bell-new';

const styles = StyleSheet.create({
    avatar: {
        height: 35,
        width: 35,
        borderRadius: 50,
        marginLeft: 14,
        border: '1px solid #DFE0EB'
    },
    container: {
        height: 40
    },
    cursorPointer: {
        cursor: 'pointer'
    },
    name: {
        fontFamily: 'Muli',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: 14,
        lineHeight: '20px',
        textAlign: 'right',
        letterSpacing: 0.2,
        '@media (max-width: 1080px)': {
            display: 'none'
        }
    },
    separator: {
        borderLeft: '1px solid #DFE0EB',
        marginLeft: 32,
        marginRight: 32,
        height: 32,
        width: 2,
        '@media (max-width: 1080px)': {
            marginLeft: 12,
            marginRight: 12
        }
    },
    title: {
        fontFamily: 'Muli',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 24,
        lineHeight: '30px',
        letterSpacing: 0.3,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '@media (max-width: 1080px)': {
            marginLeft: 36,
            maxWidth: '30%'
        },
        '@media (max-width: 468px)': {
            fontSize: 20
        }
    },
    iconStyles: {
        cursor: 'pointer',
        marginLeft: 25,
        '@media (max-width: 1080px)': {
            marginLeft: 12
        }
    }
});

function HeaderComponent(props) {
    const expenses = useExpenses();
    const { location } = useReactRouter();

    useEffect(() => {
        if (location.pathname.indexOf('/sheet/') === 0 && expenses.user) {
            const sheetId = location.pathname.split('/')[2];
            const sheet = expenses.user.sheets[sheetId];
            if (!sheet) {
                expenses.logout();
            }
        }
    }, [location, expenses, expenses.user]);

    if (!expenses.user) {
        return <div></div>;;
    }

    let title = location.pathname.split('/').pop();
    if (location.pathname.indexOf('/sheet/') === 0) {
        const sheetId = location.pathname.split('/')[2];
        const sheet = expenses.user.sheets[sheetId];
        if (sheet) {
            title = sheet.name;
        } else {
            title = '';
        }
    }
    title = '';
    return (
        <Row
            className={css(styles.container)}
            vertical="center"
            horizontal="space-between"
            {...props}
        >
            <span className={css(styles.title)}>{title}</span>
            <Row vertical="center">
                <div className={css(styles.iconStyles)}>
                    <IconSearch />
                </div>
                <div className={css(styles.iconStyles)}>
                    <IconBellNew />
                </div>
                <div className={css(styles.separator)}></div>
                <Row vertical="center">
                    <span className={css(styles.name, styles.cursorPointer)}>
                        {expenses.user.name}
                    </span>
                    <img
                        src={expenses.user.photoUrl}
                        alt="avatar"
                        className={css(styles.avatar, styles.cursorPointer)}
                    />
                </Row>
            </Row>
        </Row>
    );
}

HeaderComponent.propTypes = {
    title: string
};

export default HeaderComponent;
