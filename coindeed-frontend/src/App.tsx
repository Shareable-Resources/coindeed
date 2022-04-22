import React from 'react';
import './App.scss';
import 'antd/dist/antd.css';
import { Switch, Route } from 'react-router-dom';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DeedDashboard from './pages/deed';
import DeedShow from './pages/deed/show';
import Error from './pages/error';
import LendingDashboardPage from './pages/lending/LendingDashboardPage';
// import { ManagersDashboardPage } from './pages/managers/ManagersDashboardPage';
import WholesaleDashboardPage from './pages/wholesales';
import { ViewWholesalePage } from './pages/wholesales/show';
// import { ViewManagerPage } from './pages/managers/show';
import AccountDashboardPage from './pages/account/index';
import * as Sentry from '@sentry/react';
import { ViewBrokerPage } from './pages/brokers/show';

function App() {
  return (
    <div className='App'>
      <main>
        <Switch>
          <Route path='/' component={DeedDashboard} exact />
          <Route path='/faq' component={Faq} />
          <Route path='/privacy' component={Privacy} />
          <Route path='/terms' component={Terms} />
          <Route path='/deed' component={DeedDashboard} exact />
          <Route path='/deed/:deedId' component={DeedShow} exact />
          <Route path='/lending' component={LendingDashboardPage} exact />
          {/* <Route path='/managers' component={ManagersDashboardPage} exact /> */}
          <Route path='/wholesale' component={WholesaleDashboardPage} exact />
          <Route path='/wholesale/:wholesaleId' component={ViewWholesalePage} exact />
          <Route path='/lending' component={LendingDashboardPage} />
          {/* <Route path='/managers' component={ManagersDashboardPage} exact />
          <Route path='/managers/:managersId' component={ViewManagerPage} exact /> */}
          <Route path='/account' component={AccountDashboardPage} exact />
          <Route path='/brokers/:brokerId' component={ViewBrokerPage} exact />
          <Route component={Error} />
        </Switch>
      </main>
    </div>
  );
}
export default Sentry.withProfiler(App);
