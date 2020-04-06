import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import useReactRouter from 'use-react-router';
import { useExpenses } from '../useExpenses';
import LogoComponent from './LogoComponent';
import MenuItemComponent from './MenuItemComponent';
import IconOverview from '../../assets/icon-overview.js';
import IconLogout from '../../assets/icon-logout.js';
import IconPlus from '../../assets/icon-plus.js';
import IconSettings from '../../assets/icon-settings';
import IconLocation from '../../assets/icon-location';
import IconIdeas from '../../assets/icon-ideas';
import IconTag from '../../assets/icon-tag';
import IconDollarCurrency from '../../assets/icon-dollar-currency';
import IconCreditCard from '../../assets/icon-creditcard';
import IconSubscription from '../../assets/icon-subscription';
import IconReceipt from '../../assets/icon-receipt.js';
import { slide as Menu } from 'react-burger-menu';

const stylesSeparator = StyleSheet.create({
    separator: {
        borderTop: '1px solid #DFE0EB',
        marginTop: 16,
        marginBottom: 16,
        opacity: 0.06
    }
});

const styles = {
    bmBurgerButton: {
        position: 'absolute',
        width: 26,
        height: 20,
        left: 24,
        top: 20
    },
    bmBurgerBars: {
        background: '#373a47'
    },
    bmBurgerBarsHover: {
        background: '#a90000'
    },
    bmCrossButton: {
        display: 'none'
    },
    bmCross: {
        background: '#bdc3c7'
    },
    bmMenuWrap: {
        position: 'fixed',
        height: '100%',
        width: 255
    },
    bmMenu: {
        background: '#373a47'
    },
    bmItem: {
        outline: 'none',
        ':focus': {
            outline: 'none'
        }
    },
    bmMorphShape: {
        fill: '#373a47'
    },
    bmOverlay: {
        background: 'rgba(0, 0, 0, 0.3)'
    }
};

function SidebarComponent() {
    const { history, location } = useReactRouter();
    const { logout, user } = useExpenses();
    const [expanded, setExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(location.pathname);

    const sheets = Object.keys((user || {}).sheets || {})
        .map((value, index) => {
            const sheet = user.sheets[value];
            const metadata = sheet.metadata || {};
            return {
                position:
                    metadata.position !== undefined ? metadata.position : index,
                show: metadata.show !== undefined ? metadata.show : true,
                id: sheet.id,
                name: sheet.name
            };
        })
        .filter(s => s.show)
        .sort((a, b) => a.position - b.position);

    const onItemClicked = path => {
        setExpanded(false);
        return history.push(path);
    };

    const isSelectedItem = ({ item, section = '', exact = false }) =>
        exact
            ? location.pathname === `${section}/${item}`
            : location.pathname.indexOf(`${section}/${item}`) === 0;

    const isMobile = () => window.innerWidth <= 1080;

    const isMobileValue = isMobile();

    return (
        <Menu
            isOpen={!isMobileValue || expanded}
            noOverlay={!isMobileValue}
            disableCloseOnEsc
            styles={styles}
        >
            <div style={{ paddingTop: 30, paddingBottom: 30 }}>
                <LogoComponent />
            </div>
            <MenuItemComponent
                title="Dashboard"
                icon={IconSubscription}
                onClick={() => onItemClicked('/dashboard')}
                active={selectedItem === 'dashboard'}
            />

            {sheets.map(s => (
                <MenuItemComponent
                    key={`sheet-${s.id}`}
                    title={s.name}
                    icon={IconOverview}
                    onClick={() =>
                        setSelectedItem(
                            selectedItem === `/sheet/${s.id}`
                                ? ''
                                : `/sheet/${s.id}`
                        )
                    }
                    active={isSelectedItem({
                        item: s.id,
                        section: '/sheet'
                    })}
                    expanded={selectedItem === `/sheet/${s.id}`}
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
                            onClick: () => onItemClicked(`/sheet/${s.id}`),
                            active: isSelectedItem({
                                item: s.id,
                                section: '/sheet',
                                exact: true
                            })
                        },
                        {
                            title: 'Categorias',
                            icon: <IconIdeas width={16} fill={'#DDE2FF'} />,
                            onClick: () =>
                                onItemClicked(`/sheet/${s.id}/categories`),
                            active: isSelectedItem({
                                item: `sheet/${s.id}/categories`
                            })
                        },
                        {
                            title: 'Cities',
                            icon: <IconLocation width={16} fill={'#DDE2FF'} />,
                            onClick: () =>
                                onItemClicked(`/sheet/${s.id}/cities`),
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
                                onItemClicked(`/sheet/${s.id}/currencies`),
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
                                onItemClicked(`/sheet/${s.id}/methods`),
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
                            onClick: () => onItemClicked(`/sheet/${s.id}/tags`),
                            active: isSelectedItem({
                                item: `sheet/${s.id}/tags`
                            })
                        },
                        {
                            title: 'Nuevo Gasto',
                            icon: <IconPlus width={16} fill={'#DDE2FF'} />,
                            onClick: () => onItemClicked(`/sheet/${s.id}/new`),
                            active: isSelectedItem({
                                item: `sheet/${s.id}/new`
                            })
                        },
                        {
                            title: 'Settings',
                            icon: <IconSettings width={16} fill={'#DDE2FF'} />,
                            onClick: () =>
                                onItemClicked(`/sheet/${s.id}/settings`),
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
            <div className={css(stylesSeparator.separator)}></div>
            <MenuItemComponent
                title="Settings"
                icon={IconSettings}
                onClick={() => onItemClicked('/Settings')}
                active={isSelectedItem({ item: 'Settings' })}
            />
            <MenuItemComponent
                title="Logout"
                icon={IconLogout}
                onClick={() => logout()}
            />
        </Menu>
    );
}

export default SidebarComponent;
