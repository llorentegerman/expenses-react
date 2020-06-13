import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import { LoadingComponent } from '../components';

const ExpensesComponent = lazy(() => import('./expenses/ExpensesComponent'));
const UpsertExpenseComponent = lazy(() =>
    import('./expenses/UpsertExpenseComponent')
);
const NewSheetComponent = lazy(() => import('./sheets/NewSheetComponent'));
const ComboItemsComponent = lazy(() =>
    import('./settings/ComboItemsComponent')
);
const UserSettingsComponent = lazy(() =>
    import('./settings/UserSettingsComponent')
);
const DashboardComponent = lazy(() => import('./dashboard/DashboardComponent'));
const SettingsSheetComponent = lazy(() =>
    import('./sheets/SettingsSheetComponent')
);

export default function RenterRoutes() {
    return (
        <Suspense
            fallback={
                <LoadingComponent loading fullScreen>
                    <div></div>
                </LoadingComponent>
            }
        >
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
                        <ComboItemsComponent
                            title="Categories"
                            type="categories"
                        />
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
                        <ComboItemsComponent
                            title="Currencies"
                            type="currencies"
                        />
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
                                        title: 'Background',
                                        type: 'color'
                                    },
                                    {
                                        name: 'color',
                                        title: 'Color',
                                        type: 'color'
                                    }
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
                <Route exact path="/newsheet" component={NewSheetComponent} />
                <Route exact path="/dashboard" component={DashboardComponent} />
                <Route exact path="/" component={DashboardComponent} />
                <Route render={() => <span>Page not found</span>} />
            </Switch>
        </Suspense>
    );
}
