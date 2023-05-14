import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gallery } from '../../util/constant';

interface AppState {
    gallery: Gallery;
}

const initialState: AppState = {
    gallery: {
        shanghai: {
            contributors: ['3353040'],
            name: { en: 'Shanghai', 'zh-Hans': '上海', 'zh-Hant': '上海' },
            lastUpdateOn: 1683810518708,
        },
    },
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setGallery: (state, action: PayloadAction<Gallery>) => {
            state.gallery = action.payload;
        },
    },
});

export const { setGallery } = appSlice.actions;
export default appSlice.reducer;
