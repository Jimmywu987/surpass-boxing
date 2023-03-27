import { Lessons, User, UserOnBookingTimeSlots } from "@prisma/client";

export type UserType = User & {
  lessons: Lessons[];
  userOnBookingTimeSlots: UserOnBookingTimeSlots[];
};
