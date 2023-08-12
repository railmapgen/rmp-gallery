import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gallery } from '../../util/constant';

interface AppState {
    realWorld: Gallery;
    fantasy: Gallery;
    logins: {
        realWorld: { [id in string]: string };
        fantasy: { [id in string]: string };
    };
}

const initialState: AppState = {
    realWorld: {
        shanghai: {
            contributors: ['3353040'],
            name: { en: 'Shanghai', 'zh-Hans': '上海', 'zh-Hant': '上海' },
            lastUpdateOn: 1683810518708,
        },
    },
    fantasy: {
        wenxi: {
            contributors: ['3353040'],
            name: { en: 'Shanghai', 'zh-Hans': '上海', 'zh-Hant': '上海' },
            lastUpdateOn: 1683810518708,
        },
    },
    logins: {
        realWorld: {},
        fantasy: {},
    },
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
    },
});

export const { setRealWorld, setFantasy, setLogins } = appSlice.actions;
export default appSlice.reducer;
