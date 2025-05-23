import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './features/board/boardSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
  },
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
