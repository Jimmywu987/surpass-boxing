import { User, UserStatusEnum } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeatureKey } from "../featureKey";
import { RootState } from "../reducers";

/**
 * State
 */

const initialState: Partial<User> = {
  email: "",
  username: "",
  profileImg: "",
  phoneNumber: "",
  admin: false,
};

/**
 * Slice
 * @see https://redux-toolkit.js.org/api/createslice
 */
const userSlice = createSlice({
  name: FeatureKey.USER,
  initialState,
  reducers: {
    updateUser: (
      state: Partial<User>,
      action: PayloadAction<Partial<User>>
    ): Partial<User> => {
      const user = action.payload;
      return {
        ...state,
        ...user,
      };
    },
    clearUserInfo: (state: Partial<User>): Partial<User> => {
      return {
        ...state,
        ...initialState,
      };
    },
  },
});

/**
 * Reducer
 */
export const userReducer = userSlice.reducer;

/**
 * Action
 */
export const { updateUser, clearUserInfo } = userSlice.actions;

/**
 * Selector
 * @param state PageStateType
 */
export const userSelector = (state: RootState): Partial<User> => state.user;
