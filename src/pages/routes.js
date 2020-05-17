import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import ExpensesComponent from './expenses/ExpensesComponent';
import UpsertExpenseComponent from './expenses/UpsertExpenseComponent';
import NewSheetComponent from './sheets/NewSheetComponent';
import ComboItemsComponent from './settings/ComboItemsComponent';
import UserSettingsComponent from './settings/UserSettingsComponent';
import DashboardComponent from './dashboard/DashboardComponent';
import SettingsSheetComponent from './sheets/SettingsSheetComponent';

export default function RenterRoutes() {
    return (
        <Switch>
            <Route
                exact
                path={`/sheet/:sheetId`}
                component={ExpensesComponent}
            />
            <Route
                exact
                path={`/sheet/:sheetId/new`}
                component={UpsertExpenseComponent}
            />
            <Route
                exact
                path={`/sheet/:sheetId/edit/:expenseId`}
                component={UpsertExpenseComponent}
            />
            <Route
                exact
                path={`/sheet/:sheetId/categories`}
                render={() => (
                    <ComboItemsComponent title="Categories" type="categories" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/cities`}
                render={() => (
                    <ComboItemsComponent title="Cities" type="cities" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/currencies`}
                render={() => (
                    <ComboItemsComponent title="Currencies" type="currencies" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/methods`}
                render={() => (
                    <ComboItemsComponent title="Methods" type="methods" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/tags`}
                render={() => (
                    <ComboItemsComponent
                        title="Tags"
                        type="tags"
                        options={{
                            showEditButton: true,
                            fields: [
                                {
                                    name: 'backgroundColor',
                                    title: 'Fondo',
                                    type: 'color'
                                },
                                { name: 'color', title: 'Color', type: 'color' }
                            ]
                        }}
                    />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/settings`}
                component={SettingsSheetComponent}
            />
            <Route
                exact
                path={`/settings`}
                render={() => <UserSettingsComponent />}
            />
            <Route exact path={`/newsheet`} component={NewSheetComponent} />
            <Route exact path={`/dashboard`} component={DashboardComponent} />
            <Redirect exact from={'/'} to={'/dashboard'} />
            <Route render={() => <span>Page not found</span>} />
        </Switch>
    );
}
