import DefaultProfileImg from "@/../public/default-profile-img.png";
import { JoinOrLeaveClassIcon } from "@/features/classes/components/JoinOrLeaveClassIcon";
import { trpc } from "@/utils/trpc";
import { BookingTimeSlotStatusEnum, Lessons, User } from "@prisma/client";
import { add, endOfDay, isAfter, isPast, startOfDay } from "date-fns";
import Image from "next/image";

import useTranslation from "next-translate/useTranslation";

import { useSession } from "next-auth/react";

import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { CheckIcon } from "@chakra-ui/icons";

import { HOURS } from "@/constants";
import {
  BookingTimeSlots,
  RegularBookingTimeSlots,
} from "@/features/classes/types";
import { useMemo } from "react";

export const ClassCard = ({
  slot,
  date,
  lessonsData,
  handleOpenModel,
}: {
  slot: BookingTimeSlots | RegularBookingTimeSlots;
  date: string;
  lessonsData: Lessons[] | undefined;
  handleOpenModel: () => void;
}) => {
  const { t } = useTranslation("classes");
  const utils = trpc.useContext();

  const { startTime, endTime } = slot;
  const bookingTimeSlot = slot as BookingTimeSlots;
  const regularBookingTimeSlot = slot as RegularBookingTimeSlots;
  const isRegular = !bookingTimeSlot.status;
  const session = useSession();
  const user = session.data?.user as User;
  const { bookingTimeSlotRouter, lessonClassRouter } = utils;
  const canJoin = useMemo(() => {
    if (!lessonsData) {
      return false;
    }
    return lessonsData?.some((lesson) => {
      const { startDate, expiryDate } = lesson;
      const startOfSelectedDate = startOfDay(new Date(date));
      const endOfSelectedDate = endOfDay(new Date(date));

      return (
        isAfter(endOfDay(expiryDate), startOfSelectedDate) &&
        isAfter(endOfSelectedDate, startDate)
      );
    });
  }, [date, lessonsData]);
  const isAuthenticated = session.status === "authenticated";

  const isJoined =
    isAuthenticated &&
    !isRegular &&
    bookingTimeSlot.userOnBookingTimeSlots.some(
      (slot) => slot.userId === user.id
    );

  const dateOfClass = useMemo(
    () => startOfDay(new Date(date)).getTime() + startTime,
    [startTime, date]
  );

  const nowPlusHours = useMemo(
    () =>
      add(new Date(), {
        hours: HOURS,
      }).getTime(),
    []
  );
  const { mutateAsync: leaveClassMutateAsync, isLoading: leaveClassIsLoading } =
    trpc.classRouter.requestedClassRouter.leave.useMutation({
      onSuccess: () => {
        bookingTimeSlotRouter.fetchForStudent.invalidate();
        lessonClassRouter.fetch.invalidate();
      },
    });

  const { mutateAsync: joinClassMutateAsync, isLoading: joinClassIsLoading } =
    trpc.classRouter.requestedClassRouter.join.useMutation({
      onSuccess: () => {
        bookingTimeSlotRouter.fetchForStudent.invalidate();
        lessonClassRouter.fetch.invalidate();
      },
    });

  const {
    mutateAsync: joinRegularClassMutateAsync,
    isLoading: joinRegularClassIsLoading,
  } = trpc.classRouter.regularClassRouter.join.useMutation({
    onSuccess: () => {
      bookingTimeSlotRouter.fetchForStudent.invalidate();
      lessonClassRouter.fetch.invalidate();
    },
  });

  const joinRegularClass = async (slot: RegularBookingTimeSlots) => {
    await joinRegularClassMutateAsync({
      id: slot.id,
      date,
    });
  };

  const leaveClass = async (slot: BookingTimeSlots) => {
    const { id, status } = slot;
    await leaveClassMutateAsync({
      id,
      status,
    });
  };
  const joinClass = async (slot: BookingTimeSlots) => {
    await joinClassMutateAsync({ id: slot.id, selectedDateInString: date });
  };

  const shouldDisabled =
    !canJoin ||
    isPast(dateOfClass) ||
    nowPlusHours > dateOfClass ||
    leaveClassIsLoading ||
    joinClassIsLoading ||
    joinRegularClassIsLoading ||
    bookingTimeSlot.status === BookingTimeSlotStatusEnum.CANCELED;

  return (
    <div className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg text-white">
      <div className="space-y-2">
        <div className="text-2xl flex items-center space-x-2">
          {!isRegular &&
            bookingTimeSlot.status === BookingTimeSlotStatusEnum.CONFIRM && (
              <CheckIcon bg="green.600" rounded="full" p="1" />
            )}
          <span className="font-semibold">{slot.className}</span>
          {bookingTimeSlot.status === BookingTimeSlotStatusEnum.CANCELED && (
            <span className="text-[18px]">({t("classes:canceled")})</span>
          )}
        </div>
        <div>
          {getTimeDuration({
            startTime,
            endTime,
          })}
          <div>
            {t("classes:duration")}:{" "}
            {t(
              ...(getDuration({
                startTime,
                endTime,
              }) as [string])
            )}
          </div>
        </div>
        {!isRegular && (
          <div className="space-y-2">
            {!!slot.numberOfParticipants ? (
              <div>
                {t("classes:set_limit")}
                {": "}
                {`${bookingTimeSlot.userOnBookingTimeSlots.length} /${slot.numberOfParticipants}`}
              </div>
            ) : (
              <div>
                {t("classes:number_of_participants")}
                {": "}
                {`${bookingTimeSlot.userOnBookingTimeSlots.length}`}
              </div>
            )}
            {isAuthenticated && (
              <div className="flex gap-1 flex-wrap ">
                {bookingTimeSlot.userOnBookingTimeSlots.map((slot, index) => (
                  <div key={index}>
                    <div className="w-10 h-10 relative">
                      <Image
                        src={slot.user.profileImg ?? DefaultProfileImg}
                        alt={`${slot.user.username} profile image`}
                        className="w-full h-full rounded-full object-cover"
                        fill
                      />
                    </div>
                    <div>{slot.user.username}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between">
        <div>
          {!isRegular && !!bookingTimeSlot.coach && (
            <div>
              {t("classes:coaches")}
              {": "}
              {bookingTimeSlot.coach.username}
            </div>
          )}
          {isRegular &&
            regularBookingTimeSlot.coach &&
            !!regularBookingTimeSlot.coach.username && (
              <div>
                {t("classes:coaches")}
                {": "}
                {regularBookingTimeSlot.coach.username}
              </div>
            )}
        </div>
        <div className="self-end">
          <JoinOrLeaveClassIcon
            shouldDisabled={shouldDisabled}
            isJoined={isJoined}
            onClickLeaveClass={async () => {
              if (shouldDisabled) {
                return;
              }
              await leaveClass(slot as BookingTimeSlots);
            }}
            onClickJoinClass={async () => {
              if (shouldDisabled) {
                return;
              }
              if (!lessonsData || lessonsData.length === 0) {
                handleOpenModel();
                return;
              }

              if (isRegular) {
                await joinRegularClass(slot as RegularBookingTimeSlots);
                return;
              }
              await joinClass(slot as BookingTimeSlots);
            }}
          />
        </div>
      </div>
    </div>
  );
};
