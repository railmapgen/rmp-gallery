import { HashRouter, Route, Routes } from 'react-router-dom';
import Donation from './donation';
import GalleryView from './gallery';
import Ticket from './ticket';
import WindowHeader from './window-header';
import { RMErrorBoundary, RMMantineProvider, RMWindow } from '@railmapgen/mantine-components';

export default function AppRoot() {
    return (
        <HashRouter>
            <RMMantineProvider>
                <RMWindow>
                    <WindowHeader />
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <RMErrorBoundary>
                                    <GalleryView />
                                </RMErrorBoundary>
                            }
                        />
                        <Route
                            path="/new"
                            element={
                                <RMErrorBoundary>
                                    <Ticket />
                                </RMErrorBoundary>
                            }
                        />
                        <Route
                            path="/donation"
                            element={
                                <RMErrorBoundary>
                                    <Donation />
                                </RMErrorBoundary>
                            }
                        />
                    </Routes>
                </RMWindow>
            </RMMantineProvider>
        </HashRouter>
    );
}
