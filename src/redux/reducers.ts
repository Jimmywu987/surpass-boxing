import { combineReducers } from "redux";

import { timeSlotReducer } from "./timeSlot";

/**
 * Combine reducers
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript
 */
export const rootReducer = combineReducers({
  timeSlot: timeSlotReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
