import { BookingTimeSlots, UserOnBookingTimeSlots } from "@prisma/client";

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
