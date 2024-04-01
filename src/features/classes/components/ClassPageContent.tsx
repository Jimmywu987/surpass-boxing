import { ClassCard } from "@/features/classes/components/ClassCard";
import { RouterOutput } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";
import { BookingTimeSlotStatusEnum, Lessons } from "@prisma/client";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useMemo } from "react";

import { BookingTimeSlots } from "@/features/classes/types";
type inferType = RouterOutput["bookingTimeSlotRouter"]["fetchForStudent"];
type ClassPageContentProps = {
  data: inferType | undefined;

  isLoading: boolean;
  lessonsData: Lessons[] | undefined;
  handleOpenModel: () => void;
  onlyShowConfirmedClasses: boolean;
};
export const ClassPageContent = ({
  data,
  isLoading,
  lessonsData,
  handleOpenModel,

  onlyShowConfirmedClasses,
}: ClassPageContentProps) => {
  const { t } = useTranslation("classes");

  const classes = useMemo(() => {
    if (!data) {
      return [];
    }
    const { sortedBookingTimeSlots } = data;

    const timeSlots = Object.values(sortedBookingTimeSlots);
    timeSlots.sort((a, b) => a.number - b.number);
    for (let i = 0; i < timeSlots.length; i++) {
      timeSlots[i].timeSlots.sort((a, b) => a.startTime - b.startTime);
    }
    return timeSlots;
  }, [data]);

  if (!data || isLoading) {
    return (
      <div className="mx-2">
        <Stack>
          <Skeleton height="120px" />
        </Stack>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {classes.map(({ date, timeSlots, dayOffReasons, isDayOff }, indx) => {
        const filteredTimeSlots = onlyShowConfirmedClasses
          ? timeSlots.filter(
              (slot) => slot.status === BookingTimeSlotStatusEnum.CONFIRM
            )
          : timeSlots;

        if (filteredTimeSlots.length === 0 && onlyShowConfirmedClasses)
          return null;
        return (
          <div key={indx} className="space-y-1">
            <div className=" font-semibold p-3 border border-gray-600">
              <p className="text-lg text-white">{`${date} ${t(
                `classes:${format(new Date(date), "EEEE").toLowerCase()}`
              )} ${isDayOff ? `(Closed) ${dayOffReasons}` : ""}`}</p>
            </div>
            {!isDayOff &&
              filteredTimeSlots.map((slot) => {
                return (
                  <ClassCard
                    slot={slot as BookingTimeSlots}
                    date={date}
                    lessonsData={lessonsData}
                    handleOpenModel={handleOpenModel}
                    key={slot.id}
                  />
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
