import React from 'react';
import { bool, func, string } from 'prop-types';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import CollapsibleComponent from '../CollapsibleComponent';

const styles = StyleSheet.create({
    activeContainer: {
        backgroundColor: 'rgba(221,226,255, 0.08)'
    },
    activeBar: {
        borderLeft: '3px solid #DDE2FF'
    },
    activeTitle: {
        color: '#DDE2FF'
    },
    container: {
        display: 'flex',
        height: 56,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(221,226,255, 0.08)'
        },
        ':focus': {
            outline: 'none'
        },
        paddingLeft: 32,
        paddingRight: 32,
        transition: 'all 0.2s ease-in-out'
    },
    containerSubItem: {
        height: 56,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(221,226,255, 0.08)'
        },
        paddingLeft: 64,
        transition: 'all 0.2s ease-in-out'
    },
    inactiveBar: {
        borderLeft: '3px solid #8b8d94'
    },
    title: {
        fontFamily: 'Muli',
        fontSize: 16,
        lineHeight: '20px',
        letterSpacing: '0.2px',
        color: '#A4A6B3',
        marginLeft: 24
    }
});

function SubItem(props, index) {
    const { active, expanded, icon, title, ...otherProps } = props;
    return (
        <Row
            key={`subitem-${index}`}
            className={css(
                styles.containerSubItem,
                active && styles.activeContainer,
                active ? styles.activeBar : styles.inactiveBar
            )}
            vertical="center"
            {...otherProps}
        >
            {icon}
            <span className={css(styles.title, styles.activeTitle)}>
                {title}
            </span>
        </Row>
    );
}

function MenuItemComponent(props) {
    const {
        active,
        expanded,
        icon,
        subItems = [],
        title,
        onClick,
        ...otherProps
    } = props;
    const Icon = icon;

    return (
        <Column>
            <Row
                vertical="center"
                onClick={onClick}
                {...otherProps}
                className={`${css(
                    styles.container,
                    active && styles.activeContainer,
                    active && styles.activeBar
                )}`}
            >
                <Icon
                    fill={active ? '#DDE2FF' : '#9FA2B4'}
                    opacity={!active && '0.4'}
                />
                <span
                    className={css(styles.title, active && styles.activeTitle)}
                >
                    {title}
                </span>
            </Row>
            {subItems && subItems.length ? (
                <CollapsibleComponent expanded={expanded}>
                    {subItems.map((s, i) => SubItem({ ...s, expanded }, i))}
                </CollapsibleComponent>
            ) : (
                <div></div>
            )}
        </Column>
    );
}

MenuItemComponent.propTypes = {
    active: bool,
    icon: func,
    title: string
};

export default MenuItemComponent;
