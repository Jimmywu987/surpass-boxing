import { RouterOutput } from "@/utils/trpc";

type inferType = RouterOutput["bookingTimeSlotRouter"]["fetchForStudent"];
export type BookingTimeSlots = inferType["bookingTimeSlots"][0];
export type RegularBookingTimeSlots = inferType["regularBookingSlot"][0];
