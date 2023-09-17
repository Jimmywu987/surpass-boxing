import { Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import { ModalComponent } from "@/features/common/components/Modal";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { updateTimeSlot } from "@/redux/timeSlot";
import { CheckIcon } from "@chakra-ui/icons";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useState } from "react";

import { ViewRequestedClass } from "@/features/admin/components/ViewRequestedClass";
import { PaginationSection } from "@/features/common/components/PaginationSection";
import { trpc } from "@/utils/trpc";
import { useDispatch } from "react-redux";

export const AdminConfirmedClass = () => {
  const { t } = useTranslation("admin");

  const modalDisclosure = useDisclosure();
  const dispatch = useDispatch();

  const [query, setQuery] = useState({
    skip: 0,
  });

  const { onOpen } = modalDisclosure;

  const { data, isLoading } =
    trpc.classRouter.fetchConfirmedClasses.useQuery(query);

  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {data.bookingTimeSlots.map(({ date, timeSlots }, indx) => {
          return (
            <div key={indx} className="space-y-1">
              <div className="text-lg font-semibold p-3 border border-gray-600">
                {`${date} ${t(
                  `classes:${format(new Date(date), "EEEE").toLowerCase()}`
                )}`}
              </div>
              {timeSlots.map((timeSlot) => {
                const { startTime, endTime } = timeSlot;

                return (
                  <div
                    key={timeSlot.id}
                    className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-400 cursor-pointer"
                    onClick={() => {
                      dispatch(updateTimeSlot({ timeSlot }));
                      onOpen();
                    }}
                  >
                    <div className="space-y-2">
                      <div className="text-2xl flex items-center space-x-2">
                        {timeSlot.status ===
                          BookingTimeSlotStatusEnum.CONFIRM && (
                          <CheckIcon bg="green.600" rounded="full" p="1" />
                        )}

                        <span className="font-semibold">
                          {timeSlot.className} (
                          {t(`classes:${timeSlot.level.toLowerCase()}`)})
                        </span>
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
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        {!!timeSlot.coach && (
                          <div>
                            {t("classes:coaches")}
                            {": "}
                            {timeSlot.coach.username}
                          </div>
                        )}
                        {!!timeSlot.numberOfParticipants ? (
                          <div>
                            {t("classes:set_limit")}
                            {": "}
                            {`${timeSlot.userOnBookingTimeSlots.length} /${timeSlot.numberOfParticipants}`}
                          </div>
                        ) : (
                          <div>
                            {t("classes:number_of_participants")}
                            {": "}
                            {`${timeSlot.userOnBookingTimeSlots.length}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        {data.bookingTimeSlots.length !== 0 ? (
          <PaginationSection
            setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
            query={query}
            totalCount={data.totalConfirmedClassesCount}
          />
        ) : (
          <div>{t("admin:no_data")}</div>
        )}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <ViewRequestedClass
            modalDisclosure={modalDisclosure}
            isPast={false}
          />
        }
      />
    </div>
  );
};
