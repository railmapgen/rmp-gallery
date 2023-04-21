import rmgRuntime from '@railmapgen/rmg-runtime';
import { Button } from '@chakra-ui/react';
import WindowHeader from './window-header';
import { useRootDispatch, useRootSelector } from '../redux';
import { bumpCounter } from '../redux/app/app-slice';
import {
    RmgDebouncedInput,
    RmgLabel,
    RmgPage,
    RmgPageHeader,
    RmgThemeProvider,
    RmgWindow,
} from '@railmapgen/rmg-components';
import { useTranslation } from 'react-i18next';

export default function AppRoot() {
    const { t } = useTranslation();
    const dispatch = useRootDispatch();
    const counter = useRootSelector(state => state.app.counter);

    return (
        <RmgThemeProvider>
            <RmgWindow>
                <WindowHeader />
                <RmgPage>
                    <RmgPageHeader>
                        <RmgLabel label="Quick filter">
                            <RmgDebouncedInput placeholder="Filter anything" />
                        </RmgLabel>
                    </RmgPageHeader>
                    This is a seed project for RMG with React framework.
                    <br />
                    Please replace any &quot;RMG Seed Project&quot; or &quot;seed-project&quot; with the correct
                    component name.
                    <br />
                    Chakra UI and Redux store have been setup already. Here&apos;s an example state: {counter}.
                    <br />
                    <Button onClick={() => dispatch(bumpCounter())}>Bump</Button>
                    <br />
                    RMG Runtime has been setup. Click the button below to open RMG in another tab.
                    <br />
                    <Button onClick={() => rmgRuntime.openApp('rmg')}>
                        {t('Open')} {t('Rail Map Generator')}
                    </Button>
                </RmgPage>
            </RmgWindow>
        </RmgThemeProvider>
    );
}
