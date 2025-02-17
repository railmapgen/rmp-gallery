import { logger } from '@railmapgen/rmg-runtime';
import { createStore } from '../redux';
import { setRmtToken } from '../redux/app/app-slice';
import { LocalStorageKey } from './constant';

/**
 * Account state managed and persisted to localStorage by RMT.
 * Read Only.
 */
interface AccountState {
    id: number;
    name: string;
    email: string;
    token: string;
    expires: string;
    refreshToken: string;
    refreshExpires: string;
}

/**
 * Watch the localStorage change and update the login state and token.
 */
export const onLocalStorageChangeRMT = (store: ReturnType<typeof createStore>) => {
    const handleAccountChange = (accountString?: string) => {
        if (!accountString) {
            logger.debug('Account string is empty, logging out');
            store.dispatch(setRmtToken(undefined));
            return;
        }

        const accountState = JSON.parse(accountString) as AccountState;
        const { token } = accountState;
        logger.debug(`Updating token to: ${token}`);
        store.dispatch(setRmtToken(token));
    };

    // Record the previous account string and only handle the change.
    let previousAccountString = localStorage.getItem(LocalStorageKey.ACCOUNT);
    handleAccountChange(previousAccountString ?? undefined);

    window.onstorage = () => {
        const accountString = localStorage.getItem(LocalStorageKey.ACCOUNT);
        if (previousAccountString === accountString) {
            return;
        }
        previousAccountString = accountString;

        logger.debug(`Account string changed to: ${accountString}`);
        handleAccountChange(accountString ?? undefined);
    };
};
