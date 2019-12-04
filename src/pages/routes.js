import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import ExpensesComponent from './expenses/ExpensesComponent';
import UpsertExpenseComponent from './expenses/UpsertExpenseComponent';
import NewSheetComponent from './sheets/NewSheetComponent';
import ComboItemsComponent from './settings/ComboItemsComponent';
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
                    <ComboItemsComponent title="Categorias" type="categories" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/cities`}
                render={() => (
                    <ComboItemsComponent title="Ciudades" type="cities" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/currencies`}
                render={() => (
                    <ComboItemsComponent title="Moneda" type="currencies" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/methods`}
                render={() => (
                    <ComboItemsComponent title="Forma de pago" type="methods" />
                )}
            />
            <Route
                exact
                path={`/sheet/:sheetId/tags`}
                render={() => <ComboItemsComponent title="Tags" type="tags" />}
            />
            <Route
                exact
                path={`/sheet/:sheetId/settings`}
                component={SettingsSheetComponent}
            />
            <Route exact path={`/newsheet`} component={NewSheetComponent} />
            <Route exact path={`/dashboard`} component={DashboardComponent} />
            <Redirect exact from={'/'} to={'/dashboard'} />
            <Route render={() => <span>Page not found</span>} />
        </Switch>
    );
}
