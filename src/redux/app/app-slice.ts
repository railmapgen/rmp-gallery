import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gallery, RmtLogin } from '../../util/constant';

interface AppState {
    realWorld: Gallery;
    fantasy: Gallery;
    logins: {
        realWorld: { [id in string]: string };
        fantasy: { [id in string]: string };
    };
    serverUsers: { [id in number]: string };
    rmtLogin?: RmtLogin;
}

const initialState: AppState = {
    realWorld: {
        shanghai: {
            contributors: ['3353040'],
            name: { en: 'Shanghai', 'zh-Hans': '上海', 'zh-Hant': '上海' },
            lastUpdateOn: 1683810518708,
        },
    },
    fantasy: {},
    logins: {
        realWorld: {},
        fantasy: {},
    },
    serverUsers: [],
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setRealWorld: (state, action: PayloadAction<Gallery>) => {
            state.realWorld = action.payload;
        },
        setFantasy: (state, action: PayloadAction<Gallery>) => {
            state.fantasy = action.payload;
        },
        setLogins: (state, action: PayloadAction<AppState['logins']>) => {
            state.logins = action.payload;
        },
        setServerUsers: (state, action: PayloadAction<AppState['serverUsers']>) => {
            state.serverUsers = action.payload;
        },
        setRmtLogin: (state, action: PayloadAction<RmtLogin>) => {
            state.rmtLogin = action.payload;
        },
    },
});

export const { setRealWorld, setFantasy, setLogins, setServerUsers, setRmtLogin } = appSlice.actions;
export default appSlice.reducer;
