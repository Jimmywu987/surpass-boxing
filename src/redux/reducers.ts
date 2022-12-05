import { combineReducers } from "redux";
import { loadingReducer } from "./loading";
import { userReducer } from "./user";

/**
 * Combine reducers
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript
 */
export const rootReducer = combineReducers({
  loading: loadingReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
