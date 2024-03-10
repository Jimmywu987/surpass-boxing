import { BookingTimeSlots, UserOnBookingTimeSlots } from "@prisma/client";
import { RouterOutput } from "@/utils/trpc";

export type UserType = RouterOutput["userRouter"]["fetch"]["users"][0];

type BookingTimeSlotsType = BookingTimeSlots & {
  coach: { username: string } | null;
};

export type TimeSlotsType = BookingTimeSlotsType & {
  userOnBookingTimeSlots: (UserOnBookingTimeSlots & {
    user: {
      username: string;
      profileImg: string;
    };
  })[];
};

export type SortedBookingTimeSlotsType = {
  date: string;
  timeSlots: TimeSlotsType[];
}[];

export type SortedTimeSlotsType = {
  [key: string]: {
    number: number;
    date: string;
    timeSlots: TimeSlotsType[];
    isDayOff: boolean;
    dayOffReasons: string | null;
  };
};
