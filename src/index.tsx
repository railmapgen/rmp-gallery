import rmgRuntime from '@railmapgen/rmg-runtime';
import { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import AppRoot from './components/app-root';
import i18n from './i18n/config';
import './index.css';
import store from './redux';
import initStore from './redux/init';
import { Events } from './util/constant';
import { onLocalStorageChangeRMT } from './util/token';

let root: Root;

const renderApp = () => {
    root = createRoot(document.getElementById('root') as HTMLDivElement);
    root.render(
        <StrictMode>
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <AppRoot />
                </I18nextProvider>
            </Provider>
        </StrictMode>
    );
};

rmgRuntime.ready().then(() => {
    initStore(store);
    renderApp();
    rmgRuntime.injectUITools();
    rmgRuntime.event(Events.APP_LOAD, {});

    onLocalStorageChangeRMT(store); // update the login state and token read from localStorage
});
