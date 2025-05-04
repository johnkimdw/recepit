import { configureStore } from "@reduxjs/toolkit";
import recipeReducer from "./recipeSlice";

export const store = configureStore({
  reducer: {
    recipes: recipeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
