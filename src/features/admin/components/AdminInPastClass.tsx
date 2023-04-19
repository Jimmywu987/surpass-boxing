import {
  Button,
  ButtonGroup,
  Skeleton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ModalComponent } from "@/features/common/components/Modal";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { endOfDay, format, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useState } from "react";

import { ViewRequestedClass } from "@/features/admin/components/ViewRequestedClass";

import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
import { timeSlotSelector, updateTimeSlot } from "@/redux/timeSlot";
import { useDispatch, useSelector } from "react-redux";
import { AdminPeriodOptionsEnum } from "../enums/AdminOptionEnums";
import { SKIP_NUMBER, TAKE_NUMBER } from "@/constants";
import { DatePicker } from "@/features/common/components/DatePicker";
import { trpc } from "@/utils/trpc";

export const AdminInPastClass = () => {
  const { t, lang } = useTranslation("admin");
  const [isOpen, setIsOpen] = useState(false);
  const modalDisclosure = useDisclosure();
  const dispatch = useDispatch();
  const yesterday = endOfDay(subDays(new Date(), 1)).toString();

  const [query, setQuery] = useState({
    skip: 0,
    date: yesterday,
    period: AdminPeriodOptionsEnum.ALL,
  });
  const dateTime = new Date(query.date);
  const { timeSlot } = useSelector(timeSlotSelector);

  const { onOpen } = modalDisclosure;
  const { data, isLoading } =
    trpc.classRouter.requestedClassRouter.fetch.useQuery({
      ...query,
      isPast: true,
    });
  const handleOpenModel = () => {
    onOpen();
  };
  const variants = {
    open: { x: "90%" },
    closed: { x: 0 },
  };
  return (
    <div className="space-y-2">
      <div className="relative w-full">
        <motion.div
          className={`absolute z-10 w-full  h-full bg-gray-800 pt-1 flex space-x-2`}
          animate={isOpen ? "open" : "closed"}
          variants={variants}
          transition={{ duration: 0.4 }}
        >
          <ArrowRightIcon
            className={`p-1 text-3xl border-2 rounded-full cursor-pointer transition duration-100 transform ${
              isOpen && "rotate-180"
            }`}
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          />
          <div
            className="py-1 cursor-pointer"
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          >
            <p> {isOpen ? "CLOSE" : "OPEN"}</p>
          </div>
        </motion.div>
        <ButtonGroup gap="2">
          {Object.values(AdminPeriodOptionsEnum).map((period, index) => (
            <Button
              key={index}
              colorScheme="whiteAlpha"
              variant={period === query.period ? "solid" : "outline"}
              onClick={() => {
                setQuery({
                  skip: 0,
                  date: query.date,
                  period,
                });
              }}
            >
              {t(period.toLowerCase())}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div
        className={`flex space-x-2 pt-2 border-t border-t-gray-600 items-center ${
          query.period === AdminPeriodOptionsEnum.ALL && "opacity-30"
        }`}
      >
        <div className="w-36">
          <DatePicker
            datePickerProps={{
              disabled: query.period === AdminPeriodOptionsEnum.ALL,
              date: dateTime,
              onDateChange: (value) => {
                setQuery({
                  skip: 0,
                  date: value.toString(),
                  period: query.period,
                });
              },
              maxDate: new Date(yesterday),
            }}
          />
        </div>
        <div className="text-white">
          {t(`classes:${format(dateTime, "EEEE").toLowerCase()}`)}
        </div>
      </div>
      {!data || isLoading ? (
        <Stack>
          <Skeleton height="30px" />
        </Stack>
      ) : (
        <>
          <div className="flex space-x-2">
            <div>
              <span>{t("admin:in_total")}: </span>
              <span>{data.totalClassesCount}</span>
            </div>
            <div>
              <span>{t("admin:total_confirmed")}: </span>
              <span>{data.totalConfirmedClasses}</span>
            </div>
            <div>
              <span>{t("admin:total_canceled")}: </span>
              <span>{data.totalCanceledClasses}</span>
            </div>
            <div>
              <span>{t("admin:total_pending")}: </span>
              <span>
                {data.totalClassesCount -
                  data.totalCanceledClasses -
                  data.totalConfirmedClasses}
              </span>
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
                            {getTimeDuration({ startTime, endTime })}
                            <div>
                              {t("classes:duration")}:{" "}
                              {t(
                                ...(getDuration({ startTime, endTime }) as [
                                  string
                                ])
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
                  setQuery={
                    setQuery as Dispatch<SetStateAction<{ skip: number }>>
                  }
                />
                <button
                  className={`flex space-x-1 items-center ${
                    data.totalClassesCount < query.skip + SKIP_NUMBER &&
                    " cursor-default opacity-40 "
                  }`}
                  onClick={() => {
                    setQuery((prev) => ({
                      ...prev,
                      skip: prev.skip + SKIP_NUMBER,
                    }));
                  }}
                  disabled={data.totalClassesCount < query.skip + SKIP_NUMBER}
                >
                  <span>{t("common:action.next")}</span>
                  <ChevronRightIcon className="text-xl" />
                </button>
              </div>
            ) : (
              <div>{t("admin:no_data")}</div>
            )}
          </div>
        </>
      )}
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <ViewRequestedClass modalDisclosure={modalDisclosure} isPast={true} />
        }
      />
    </div>
  );
};
