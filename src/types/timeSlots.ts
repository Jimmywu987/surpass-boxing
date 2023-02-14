import { BookingTimeSlots, UserOnBookingTimeSlots } from "@prisma/client";

export type TimeSlotsType = BookingTimeSlots & {
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
