import { combineReducers } from "redux";
import { loadingReducer } from "./loading";
import { userReducer } from "./user";
import { timeSlotReducer } from "./timeSlot";

/**
 * Combine reducers
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript
 */
export const rootReducer = combineReducers({
  loading: loadingReducer,
  user: userReducer,
  timeSlot: timeSlotReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
