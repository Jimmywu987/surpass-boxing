import { ClassCard } from "@/features/classes/components/ClassCard";
import { RouterOutput } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";
import { Lessons } from "@prisma/client";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useMemo } from "react";

import { BookingTimeSlots } from "@/features/classes/types";
type inferType = RouterOutput["bookingTimeSlotRouter"]["fetchForStudent"];
type ClassPageContentProps = {
  data: inferType | undefined;
  query: {
    skip: number;
    date: string;
  };
  setQuery: Dispatch<
    SetStateAction<{
      skip: number;
      date: string;
    }>
  >;
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
  query,
  setQuery,
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
        return (
          <div key={indx} className="space-y-1">
            <div className=" font-semibold p-3 border border-gray-600">
              <p className="text-lg text-white">{`${date} ${t(
                `classes:${format(new Date(date), "EEEE").toLowerCase()}`
              )} ${isDayOff ? `(Closed) ${dayOffReasons}` : ""}`}</p>
            </div>
            {!isDayOff &&
              timeSlots.map((slot) => {
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
      {/* {classes
        .filter((slot) => {
          const bookingTimeSlot = slot as BookingTimeSlots;
          return (
            !onlyShowConfirmedClasses ||
            (bookingTimeSlot.status &&
              bookingTimeSlot.status === BookingTimeSlotStatusEnum.CONFIRM)
          );
        })
        .map((slot) => (
          <ClassCard
            slot={slot}
            date={query.date}
            lessonsData={lessonsData}
            handleOpenModel={handleOpenModel}
            key={slot.id}
          />
        ))}
      {data.bookingTimeSlots.length !== 0 ? (
        <PaginationSection
          setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
          query={query}
          totalCount={data.totalClassesCount}
        />
      ) : data.regularBookingSlot.length === 0 ? (
        <div className="flex justify-center text-white text-xl my-12">
          {data?.dayOffReason ? data?.dayOffReason : t("admin:no_data")}
        </div>
      ) : (
        <></>
      )} */}
    </div>
  );
};
