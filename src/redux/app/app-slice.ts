import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gallery } from '../../util/constant';

interface AppState {
    counter: number;
    gallery: Gallery;
}

const initialState: AppState = {
    counter: 0,
    gallery: {
        shanghai: { contributors: ['3353040'], name: { en: 'Shanghai', 'zh-Hans': '上海', 'zh-Hant': '上海' } },
    },
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        bumpCounter: state => {
            state.counter++;
        },
        setGallery: (state, action: PayloadAction<Gallery>) => {
            state.gallery = action.payload;
        },
    },
});

export const { bumpCounter, setGallery } = appSlice.actions;
export default appSlice.reducer;
