import React, { useState } from 'react';
import { Column, Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { useExpenses } from '../useExpenses';
import LogoComponent from './LogoComponent';
import MenuItemComponent from './MenuItemComponent';
import IconOverview from '../../assets/icon-overview.js';
import IconLogout from '../../assets/icon-logout.js';
import IconPlus from '../../assets/icon-plus.js';
import IconSettings from '../../assets/icon-settings';
import IconBurger from '../../assets/icon-burger';
import IconLocation from '../../assets/icon-location';
import IconIdeas from '../../assets/icon-ideas';
import IconTag from '../../assets/icon-tag';
import IconDollarCurrency from '../../assets/icon-dollar-currency';
import IconCreditCard from '../../assets/icon-creditcard';
import IconSubscription from '../../assets/icon-subscription';
import IconReceipt from '../../assets/icon-receipt.js';

const styles = StyleSheet.create({
    burgerIcon: {
        cursor: 'pointer',
        position: 'absolute',
        left: 24,
        top: 34,
        '@media (max-width: 1080px)': {
            top: 14
        }
    },
    overlay: {
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        position: 'fixed',
        zIndex: 900,
        top: 0,
        left: 0,
        overflowX: 'hidden',
        overflowY: 'hidden',
        backgroundColor: 'rgba(0,0,0, 0.5)',
        transition: '0.5s'
    },
    overlayContent: {
        backgroundColor: '#363740',
        position: 'relative',
        width: 255,
        textAlign: 'center',
        paddingTop: 30,
        zIndex: 902,
        height: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'scroll'
    },

    mainContainer: {
        height: '100%',
        minHeight: '100vh'
    },
    mainContainerMobile: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    mainContainerExpanded: {
        width: '100%',
        minWidth: '100vh'
    },
    menuItemList: {
        marginTop: 52
    },
    outsideLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 901,
        overflowX: 'hidden',
        overflowY: 'hidden'
    },
    separator: {
        borderTop: '1px solid #DFE0EB',
        marginTop: 16,
        marginBottom: 16,
        opacity: 0.06
    },
    hideDeprecated: {
        left: -255
    },
    showDeprecated: {
        left: 0
    }
});

function SidebarComponent() {
    const { history, location } = useReactRouter();
    const expenses = useExpenses();
    const [expanded, setExpanded] = useState(false);

    const onItemClicked = path => {
        setExpanded(false);
        return history.push(path);
    };

    const isSelectedItem = ({ item, section = '', exact = false }) =>
        exact
            ? location.pathname === `${section}/${item}`
            : location.pathname.indexOf(`${section}/${item}`) === 0;

    const isMobile = () => window.innerWidth <= 1080;

    const toggleMenu = () => setExpanded(!expanded);

    const renderBurger = () => {
        return (
            <div onClick={toggleMenu} className={css(styles.burgerIcon)}>
                <IconBurger />
            </div>
        );
    };

    const isMobileValue = isMobile();

    let userSheetsArray = expenses.user || { sheets: {} };
    userSheetsArray = Object.keys(userSheetsArray.sheets).map(
        sId => userSheetsArray.sheets[sId]
    );

    return (
        <div
            style={{
                position: 'relative',
                overflowY: isMobileValue && expanded ? 'hidden' : 'visible'
            }}
        >
            <Row
                className={css(styles.mainContainer)}
                breakpoints={{
                    1080: css(
                        styles.mainContainerMobile,
                        expanded && styles.mainContainerExpanded
                    )
                }}
            >
                {isMobileValue && !expanded && renderBurger()}
                <Column
                    breakpoints={{
                        1080: css(styles.overlay)
                    }}
                    style={{ width: expanded ? '100%' : 0 }}
                >
                    <Column className={css(styles.overlayContent)}>
                        <LogoComponent />
                        <Column className={css(styles.menuItemList)}>
                            <MenuItemComponent
                                title="Dashboard"
                                icon={IconSubscription}
                                onClick={() => onItemClicked('/dashboard')}
                                active={isSelectedItem({ item: 'dashboard' })}
                            />
                            {userSheetsArray.map(s => (
                                <MenuItemComponent
                                    key={`sheet-${s.id}`}
                                    title={s.name}
                                    icon={IconOverview}
                                    onClick={
                                        !isSelectedItem({
                                            item: s.id,
                                            section: '/sheet'
                                        }) &&
                                        (() => onItemClicked(`/sheet/${s.id}`))
                                    }
                                    active={isSelectedItem({
                                        item: s.id,
                                        section: '/sheet'
                                    })}
                                    subItems={[
                                        {
                                            title: 'Gastos',
                                            icon: (
                                                <IconReceipt
                                                    height={20}
                                                    width={20}
                                                    fill={'#DDE2FF'}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(`/sheet/${s.id}`),
                                            active: isSelectedItem({
                                                item: s.id,
                                                section: '/sheet',
                                                exact: true
                                            })
                                        },
                                        {
                                            title: 'Categorias',
                                            icon: (
                                                <IconIdeas
                                                    width={16}
                                                    fill={'#DDE2FF'}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/categories`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/categories`
                                            })
                                        },
                                        {
                                            title: 'Cities',
                                            icon: (
                                                <IconLocation
                                                    width={16}
                                                    fill={'#DDE2FF'}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/cities`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/cities`
                                            })
                                        },
                                        {
                                            title: 'Monedas',
                                            icon: (
                                                <IconDollarCurrency
                                                    width={20}
                                                    fill={'#DDE2FF'}
                                                    style={{ marginRight: -4 }}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/currencies`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/currencies`
                                            })
                                        },
                                        {
                                            title: 'Formas de Pago',
                                            icon: (
                                                <IconCreditCard
                                                    width={20}
                                                    fill={'#DDE2FF'}
                                                    style={{ marginRight: -4 }}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/methods`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/methods`
                                            })
                                        },
                                        {
                                            title: 'Tags',
                                            icon: (
                                                <IconTag
                                                    width={20}
                                                    fill={'#DDE2FF'}
                                                    style={{ marginRight: -4 }}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/tags`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/tags`
                                            })
                                        },
                                        {
                                            title: 'Nuevo Gasto',
                                            icon: (
                                                <IconPlus
                                                    width={16}
                                                    fill={'#DDE2FF'}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/new`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/new`
                                            })
                                        },
                                        {
                                            title: 'Settings',
                                            icon: (
                                                <IconSettings
                                                    width={16}
                                                    fill={'#DDE2FF'}
                                                />
                                            ),
                                            onClick: () =>
                                                onItemClicked(
                                                    `/sheet/${s.id}/settings`
                                                ),
                                            active: isSelectedItem({
                                                item: `sheet/${s.id}/settings`
                                            })
                                        }
                                    ]}
                                />
                            ))}
                            <MenuItemComponent
                                title="Add Sheet"
                                icon={IconPlus}
                                onClick={() => onItemClicked('/newsheet')}
                                active={isSelectedItem({ item: 'newsheet' })}
                            />
                            <div className={css(styles.separator)}></div>
                            <MenuItemComponent
                                title="Settings"
                                icon={IconSettings}
                                onClick={() => onItemClicked('/Settings')}
                                active={isSelectedItem({ item: 'Settings' })}
                            />
                            <MenuItemComponent
                                title="Logout"
                                icon={IconLogout}
                                onClick={() => expenses.logout()}
                            />
                        </Column>
                    </Column>
                    {isMobileValue && expanded && (
                        <div
                            className={css(styles.outsideLayer)}
                            onClick={toggleMenu}
                        ></div>
                    )}
                </Column>
            </Row>
        </div>
    );
}

export default SidebarComponent;
