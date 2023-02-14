import { TimeSlotsType } from "@/types/timeSlots";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeatureKey } from "../featureKey";
import { RootState } from "../reducers";

/**
 * Payload
 */
export type TimeSlotPayload = {
  timeSlot: TimeSlotsType | null;
};

/**
 * State
 */
export type TimeSlotState = {
  timeSlot: TimeSlotsType | null;
};

const initialState: TimeSlotState = {
  timeSlot: null,
};

/**
 * Slice
 * @see https://redux-toolkit.js.org/api/createslice
 */
const slice = createSlice({
  name: FeatureKey.TIME_SLOT,
  initialState,
  reducers: {
    updateTimeSlot: (
      state: TimeSlotState,
      action: PayloadAction<TimeSlotPayload>
    ): TimeSlotState => {
      const { timeSlot } = action.payload;

      return {
        ...state,
        timeSlot: timeSlot,
      };
    },
  },
});

/**
 * Reducer
 */
export const timeSlotReducer = slice.reducer;

/**
 * Action
 */
export const { updateTimeSlot } = slice.actions;

/**
 * Selector
 * @param state PageStateType
 */
export const timeSlotSelector = (state: RootState): TimeSlotState =>
  state.timeSlot;
