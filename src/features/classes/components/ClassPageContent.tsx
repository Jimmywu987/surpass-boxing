import { ClassCard } from "@/features/classes/components/ClassCard";
import {
  BookingTimeSlots,
  RegularBookingTimeSlots,
} from "@/features/classes/types";
import { PaginationSection } from "@/features/common/components/PaginationSection";
import { RouterOutput } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";
import { Lessons } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useMemo } from "react";

type inferType = RouterOutput["bookingTimeSlotRouter"]["fetchForStudent"];

export const ClassPageContent = ({
  data,
  isLoading,
  lessonsData,
  handleOpenModel,
  query,
  setQuery,
}: {
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
}) => {
  const { t } = useTranslation("classes");

  const classes = useMemo(() => {
    if (!data) {
      return [];
    }
    const timeSlots: (BookingTimeSlots | RegularBookingTimeSlots)[] = [];
    const { bookingTimeSlots, regularBookingSlot } = data;

    timeSlots.push(...bookingTimeSlots);
    timeSlots.push(...regularBookingSlot);
    timeSlots.sort((a, b) => a.startTime - b.startTime);
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
      {classes.map((slot) => (
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
      )}
    </div>
  );
};
