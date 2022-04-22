import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { BrowserRouter } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { Provider } from 'react-redux';
import AllReducers from './reducers';
import { createStore } from 'redux';

Sentry.init({
  dsn: 'https://729483451662439f91373b16b5167441@o1071798.ingest.sentry.io/6107492',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const store = createStore(AllReducers);

function getLibrary(provider: any) {
  const library = new providers.Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Web3ReactProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
