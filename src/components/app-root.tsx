import { RmgErrorBoundary, RmgPage, RmgThemeProvider, RmgWindow } from '@railmapgen/rmg-components';
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setRmtLogin } from '../redux/app/app-slice';
import Donation from './donation';
import GalleryView from './gallery';
import Ticket from './ticket';
import WindowHeader from './window-header';

export default function AppRoot() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        const p = localStorage.getItem('rmg-home__account');
        const login = p ? JSON.parse(p) : undefined;
        dispatch(setRmtLogin(login));
    }, [localStorage.getItem('rmg-home__account')]);

    return (
        <HashRouter>
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
                            <Route
                                path="/donation"
                                element={
                                    <RmgErrorBoundary>
                                        <Donation />
                                    </RmgErrorBoundary>
                                }
                            />
                        </Routes>
                    </RmgPage>
                </RmgWindow>
            </RmgThemeProvider>
        </HashRouter>
    );
}
