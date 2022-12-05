import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeatureKey } from "../featureKey";
import { RootState } from "../reducers";

/**
 * Payload
 */
export type LoadingPayload = {
  isLoading: boolean;
};

/**
 * State
 */
export type LoadingState = {
  loading: boolean;
};

const initialState: LoadingState = {
  loading: false,
};

/**
 * Slice
 * @see https://redux-toolkit.js.org/api/createslice
 */
const slice = createSlice({
  name: FeatureKey.LOADING,
  initialState,
  reducers: {
    isLoading: (
      state: LoadingState,
      action: PayloadAction<LoadingPayload>
    ): LoadingState => {
      const { isLoading } = action.payload;

      return {
        ...state,
        loading: isLoading,
      };
    },
  },
});

/**
 * Reducer
 */
export const loadingReducer = slice.reducer;

/**
 * Action
 */
export const { isLoading } = slice.actions;

/**
 * Selector
 * @param state PageStateType
 */
export const loadingSelector = (state: RootState): LoadingState =>
  state.loading;
