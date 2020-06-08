import React, { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { useExpenses } from '../../logic/useExpenses';
import { LoadingComponent } from '../loading';
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
import useSidebar from './useSidebar';

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
    const { initializing, logout, user } = useExpenses();
    const [loading, setLoading] = useState(false);
    const {
        isOpen,
        isExpanded,
        isActive,
        onMenuItemClicked,
        setIsOpen
    } = useSidebar();

    const isMobile = window.innerWidth <= 1080;

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

    const doLogout = () => {
        setLoading(true);
        logout();
    };

    return (
        <Menu
            isOpen={!isMobile || isOpen}
            noOverlay={!isMobile}
            disableCloseOnEsc
            styles={styles}
            onStateChange={state => setIsOpen(state.isOpen)}
        >
            <LoadingComponent loading={initializing || loading} fullScreen />
            <div style={{ paddingTop: 30, paddingBottom: 30 }}>
                <LogoComponent />
            </div>
            <MenuItemComponent
                title="Dashboard"
                icon={IconSubscription}
                onClick={() => onMenuItemClicked('/dashboard')}
                active={isActive('/dashboard')}
            />

            {sheets.map(s => (
                <MenuItemComponent
                    key={`sheet-${s.id}`}
                    title={s.name}
                    icon={IconOverview}
                    onClick={() =>
                        onMenuItemClicked(`/sheet/${s.id}`, {
                            isCollapsible: true
                        })
                    }
                    active={isActive(`/sheet/${s.id}`)}
                    expanded={isExpanded(`/sheet/${s.id}`)}
                    subItems={[
                        {
                            title: 'Expenses',
                            icon: (
                                <IconReceipt
                                    height={20}
                                    width={20}
                                    fill={'#DDE2FF'}
                                />
                            ),
                            onClick: () => onMenuItemClicked(`/sheet/${s.id}`),
                            active: isActive(`/sheet/${s.id}`, true)
                        },
                        {
                            title: 'Categories',
                            icon: <IconIdeas width={16} fill={'#DDE2FF'} />,

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/categories`),
                            active: isActive(`/sheet/${s.id}/categories`)
                        },
                        {
                            title: 'Cities',
                            icon: <IconLocation width={16} fill={'#DDE2FF'} />,

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/cities`),
                            active: isActive(`/sheet/${s.id}/cities`)
                        },
                        {
                            title: 'Currencies',
                            icon: (
                                <IconDollarCurrency
                                    width={20}
                                    fill={'#DDE2FF'}
                                    style={{ marginRight: -4 }}
                                />
                            ),

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/currencies`),
                            active: isActive(`/sheet/${s.id}/currencies`)
                        },
                        {
                            title: 'Methods',
                            icon: (
                                <IconCreditCard
                                    width={20}
                                    fill={'#DDE2FF'}
                                    style={{ marginRight: -4 }}
                                />
                            ),

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/methods`),
                            active: isActive(`/sheet/${s.id}/methods`)
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
                                onMenuItemClicked(`/sheet/${s.id}/tags`),
                            active: isActive(`/sheet/${s.id}/tags`)
                        },
                        {
                            title: 'Add Expense',
                            icon: <IconPlus width={16} fill={'#DDE2FF'} />,

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/new`),
                            active: isActive(`/sheet/${s.id}/new`)
                        },
                        {
                            title: 'Settings',
                            icon: <IconSettings width={16} fill={'#DDE2FF'} />,

                            onClick: () =>
                                onMenuItemClicked(`/sheet/${s.id}/settings`),
                            active: isActive(`/sheet/${s.id}/settings`)
                        }
                    ]}
                />
            ))}

            <MenuItemComponent
                title="Add Sheet"
                icon={IconPlus}
                onClick={() => onMenuItemClicked('/newsheet')}
                active={isActive('/newsheet')}
            />
            <div className={css(stylesSeparator.separator)}></div>
            <MenuItemComponent
                title="Settings"
                icon={IconSettings}
                onClick={() => onMenuItemClicked('/settings')}
                active={isActive('/settings')}
            />
            <MenuItemComponent
                title="Logout"
                icon={IconLogout}
                onClick={() => doLogout()}
            />
        </Menu>
    );
}

export default SidebarComponent;
