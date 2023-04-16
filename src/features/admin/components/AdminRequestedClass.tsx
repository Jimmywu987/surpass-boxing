import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import { CreateRequestedClassForm } from "@/features/common/components/form/CreateRequestedClassForm";
import { ModalComponent } from "@/features/common/components/Modal";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { timeSlotSelector, updateTimeSlot } from "@/redux/timeSlot";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { endOfDay, format, intervalToDuration, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { ViewRequestedClass } from "./ViewRequestedClass";
import { SKIP_NUMBER, TAKE_NUMBER } from "@/constants";
import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
import { DatePicker } from "@/features/common/components/DatePicker";
import { trpc } from "@/utils/trpc";

export const AdminRequestedClass = () => {
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const dispatch = useDispatch();

  const [query, setQuery] = useState({
    skip: 0,
    date: new Date().toString(),
  });
  const dateTime = new Date(query.date);
  const minDate = endOfDay(subDays(new Date(), 1));
  const { timeSlot } = useSelector(timeSlotSelector);

  const { onOpen } = modalDisclosure;
  const { data, isLoading } =
    trpc.classRouter.requestedClassRouter.fetch.useQuery({
      ...query,
      isPast: false,
      period: null,
    });

  const handleOpenModel = () => {
    onOpen();
  };

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
            handleOpenModel();
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
                      handleOpenModel();
                    }}
                  >
                    <div className="space-y-2">
                      <div className="text-2xl flex items-center space-x-2">
                        {timeSlot.status ===
                          BookingTimeSlotStatusEnum.CONFIRM && (
                          <CheckIcon bg="green.600" rounded="full" p="1" />
                        )}

                        <span className="font-semibold">
                          {timeSlot.className}
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
                        {!!timeSlot.coachName && (
                          <div className="">
                            {t("classes:coaches")}
                            {": "}
                            {timeSlot.coachName}
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
          <div className="flex justify-between">
            <button
              className={`flex space-x-1 items-center ${
                query.skip === 0 && " cursor-default opacity-40 "
              }`}
              onClick={() => {
                setQuery((prev) => ({
                  ...prev,
                  skip: prev.skip - SKIP_NUMBER,
                }));
              }}
              disabled={query.skip === 0}
            >
              <ChevronLeftIcon className="text-xl" />
              <span>{t("common:action.previous")}</span>
            </button>
            <PageNumberDisplay
              currentPage={SKIP_NUMBER / TAKE_NUMBER + 1}
              totalPages={Math.ceil(data.totalClassesCount / TAKE_NUMBER)}
              setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
            />
            <button
              className={`flex space-x-1 items-center ${
                data.totalClassesCount > query.skip + SKIP_NUMBER &&
                " cursor-default opacity-40 "
              }`}
              onClick={() => {
                setQuery((prev) => ({
                  ...prev,
                  skip: prev.skip + SKIP_NUMBER,
                }));
              }}
              disabled={data.totalClassesCount > query.skip + SKIP_NUMBER}
            >
              <span>{t("common:action.next")}</span>
              <ChevronRightIcon className="text-xl" />
            </button>
          </div>
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
