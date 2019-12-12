import React from 'react';
import { bool, func, string } from 'prop-types';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';

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
        paddingRight: 32
    },
    containerSubItem: {
        height: 56,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(221,226,255, 0.08)'
        },
        paddingLeft: 64
    },
    title: {
        fontFamily: 'Muli',
        fontSize: 16,
        lineHeight: '20px',
        letterSpacing: '0.2px',
        color: '#A4A6B3',
        marginLeft: 24
    },
    subItems: {
        display: 'flex',
        transition: 'max-height 0.3s ease-out',
        maxHeight: 500
    },
    subItemsHide: {
        maxHeight: 0,
        overflow: 'hidden',
        ':nth-child(n) > div > span': {
            color: 'rgba(0,0,0,0)'
        },
        ':nth-child(n) > div > svg': {
            height: 0
        }
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
                styles.activeBar
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
            {
                <Column
                    className={css(
                        styles.subItems,
                        !expanded && styles.subItemsHide
                    )}
                >
                    {subItems.map((s, i) => SubItem({ ...s, expanded }, i))}
                </Column>
            }
        </Column>
    );
}

MenuItemComponent.propTypes = {
    active: bool,
    icon: func,
    title: string
};

export default MenuItemComponent;
