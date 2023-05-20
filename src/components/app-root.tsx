import { RmgErrorBoundary, RmgLoader, RmgPage, RmgThemeProvider, RmgWindow } from '@railmapgen/rmg-components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import GalleryView from './gallery';
import Ticket from './ticket';
import WindowHeader from './window-header';

export default function AppRoot() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <RmgThemeProvider>
                <RmgWindow>
                    <WindowHeader />
                    <RmgPage>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <RmgErrorBoundary>
                                        <GalleryView />
                                    </RmgErrorBoundary>
                                }
                            />
                            <Route
                                path="/new"
                                element={
                                    <RmgErrorBoundary>
                                        <Ticket />
                                    </RmgErrorBoundary>
                                }
                            />
                        </Routes>
                    </RmgPage>
                </RmgWindow>
            </RmgThemeProvider>
        </BrowserRouter>
    );
}
