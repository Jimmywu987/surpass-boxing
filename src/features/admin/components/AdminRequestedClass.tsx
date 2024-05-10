import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import { CreateRequestedClassForm } from "@/features/common/components/form/CreateRequestedClassForm";
import { ModalComponent } from "@/features/common/components/Modal";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { timeSlotSelector, updateTimeSlot } from "@/redux/timeSlot";
import { CheckIcon } from "@chakra-ui/icons";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { endOfDay, format, isBefore, startOfDay, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useState } from "react";

import { ViewRequestedClass } from "@/features/admin/components/ViewRequestedClass";
import { DatePicker } from "@/features/common/components/DatePicker";
import { PaginationSection } from "@/features/common/components/PaginationSection";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

export const AdminRequestedClass = () => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { date, time_slot_id } = router.query;
  const modalDisclosure = useDisclosure();
  const dispatch = useDispatch();
  const now = startOfDay(new Date());

  const noSpecificDate =
    !date ||
    isNaN(new Date(date.toString()) as unknown as number) ||
    isBefore(new Date(date.toString()), now);

  const [query, setQuery] = useState({
    skip: 0,
    date: noSpecificDate ? now.toString() : date.toString(),
  });
  const dateTime = new Date(query.date);
  const minDate = endOfDay(subDays(now, 1));
  const { timeSlot } = useSelector(timeSlotSelector);

  const { onOpen } = modalDisclosure;
  const queryDate = {
    ...query,
    isPast: false,
    period: null,
    timeSlotId: !!time_slot_id ? time_slot_id.toString() : undefined,
  };
  const { data, isLoading } =
    trpc.classRouter.requestedClassRouter.fetch.useQuery(queryDate, {
      onSuccess: (data) => {
        if (!time_slot_id) return;
        data.bookingTimeSlots.map(({ timeSlots }) => {
          timeSlots.map((timeSlot) => {
            if (timeSlot.id === time_slot_id) {
              dispatch(updateTimeSlot({ timeSlot }));
              onOpen();
            }
          });
        });
        // router.replace({}, undefined, { shallow: true });
      },
    });

  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-4">
        <Button
          onClick={() => {
            dispatch(updateTimeSlot({ timeSlot: null }));
            onOpen();
          }}
          colorScheme="whiteAlpha"
          variant="solid"
        >
          {t("add_class")}
        </Button>
      </div>
      <div className="flex space-x-2 items-center">
        <div className="w-36">
          <DatePicker
            datePickerProps={{
              date: dateTime,
              onDateChange: (value) => {
                setQuery({
                  skip: 0,
                  date: value.toString(),
                });
              },
              minDate: minDate,
            }}
          />
        </div>
        <div className="text-white">
          {t(`classes:${format(dateTime, "EEEE").toLowerCase()}`)}
        </div>
      </div>
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
                        {timeSlot.status ===
                          BookingTimeSlotStatusEnum.CANCELED && (
                          <span className="text-sm bg-gray-400 text-white px-2 py-1 rounded">
                            {t("classes:canceled")}
                          </span>
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
            totalCount={data.totalClassesCount}
          />
        ) : (
          <div>{t("admin:no_data")}</div>
        )}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          !timeSlot ? (
            <CreateRequestedClassForm
              modalDisclosure={modalDisclosure}
              date={dateTime}
            />
          ) : (
            <ViewRequestedClass
              modalDisclosure={modalDisclosure}
              isPast={false}
            />
          )
        }
      />
    </div>
  );
};
