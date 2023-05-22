import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import DefaultProfileImg from "@/../public/default-profile-img.png";
import { LoginForm } from "@/features/login/components/LoginForm";
import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import {
  endOfDay,
  format,
  isPast,
  startOfDay,
  subDays,
  add,
  isBefore,
} from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { useSession } from "next-auth/react";

import { ModalComponent } from "@/features/common/components/Modal";

import { DatePicker } from "@/features/common/components/DatePicker";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { AddIcon, CheckIcon, MinusIcon } from "@chakra-ui/icons";

import { CreateRequestedClassForm } from "@/features/common/components/form/CreateRequestedClassForm";
import { PaginationSection } from "@/features/common/components/PaginationSection";
import { RouterOutput, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { HOURS } from "@/constants";

type inferType = RouterOutput["bookingTimeSlotRouter"]["fetchForStudent"];
type BookingTimeSlots = inferType["bookingTimeSlots"][0];
type RegularBookingTimeSlots = inferType["regularBookingSlot"][0];

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session = useSession();
  const router = useRouter();
  const { date: queryDate } = router.query;
  const now = new Date();

  const noSpecificDate =
    !queryDate ||
    isNaN(new Date(queryDate.toString()) as unknown as number) ||
    isBefore(new Date(queryDate.toString()), startOfDay(now));

  const utils = trpc.useContext();
  const { bookingTimeSlotRouter, lessonClassRouter } = utils;
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const [modelType, setModelType] = useState(OpenModelType.OPEN_CLASS);

  const { mutateAsync: joinClassMutateAsync } =
    trpc.classRouter.requestedClassRouter.join.useMutation({
      onSuccess: () => {
        bookingTimeSlotRouter.fetchForStudent.invalidate();
        lessonClassRouter.fetch.invalidate();
      },
    });

  const { mutateAsync: joinRegularClassMutateAsync } =
    trpc.classRouter.regularClassRouter.join.useMutation({
      onSuccess: () => {
        bookingTimeSlotRouter.fetchForStudent.invalidate();
        lessonClassRouter.fetch.invalidate();
      },
    });
  const { mutateAsync: leaveClassMutateAsync } =
    trpc.classRouter.requestedClassRouter.leave.useMutation({
      onSuccess: () => {
        bookingTimeSlotRouter.fetchForStudent.invalidate();
        lessonClassRouter.fetch.invalidate();
      },
    });

  const { data: lessonsData } = trpc.lessonClassRouter.fetch.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;

  const handleOpenModel = () => {
    onOpen();
    if (!isAuthenticated) {
      setModelType(OpenModelType.LOGIN);
      return;
    }
    if (!lessonsData || lessonsData.length === 0) {
      setModelType(OpenModelType.REQUEST_LESSON_MESSAGE);
      return;
    }
    setModelType(OpenModelType.OPEN_CLASS);
  };

  const [query, setQuery] = useState({
    skip: 0,
    date: noSpecificDate ? now.toString() : queryDate.toString(),
  });

  const { data, isLoading } =
    trpc.bookingTimeSlotRouter.fetchForStudent.useQuery(query);

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

  const joinClass = async (slot: BookingTimeSlots) => {
    await joinClassMutateAsync({ id: slot.id });
  };
  const date = new Date(query.date);
  const minDate = endOfDay(subDays(new Date(), 1));

  const joinRegularClass = async (slot: RegularBookingTimeSlots) => {
    await joinRegularClassMutateAsync({
      id: slot.id,
      date: query.date,
    });
  };

  const leaveClass = async (slot: BookingTimeSlots) => {
    const { id, status } = slot;
    await leaveClassMutateAsync({
      id,
      status,
    });
  };

  if (!data || isLoading) {
    return (
      <div className="mx-2">
        <Stack>
          <Skeleton height="30px" />
        </Stack>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 p-2 md:p-0">
        <h1 className="text-white text-3xl">{t("classes")}</h1>
        <div className="flex space-x-2 items-center">
          <div className="w-36">
            <DatePicker
              datePickerProps={{
                date,
                onDateChange: (value) => {
                  setQuery(() => ({
                    skip: 0,
                    date: value.toString(),
                  }));
                },
                minDate,
              }}
            />
          </div>
          <div className="text-white">
            {t(format(date, "EEEE").toLowerCase())}
          </div>
          <div>
            <Button onClick={handleOpenModel}>{t("open_a_class")}</Button>
          </div>
        </div>
        <div className="space-y-2">
          {classes.map((slot) => {
            const { startTime, endTime } = slot;
            const bookingTimeSlot = slot as BookingTimeSlots;
            const regularBookingTimeSlot = slot as RegularBookingTimeSlots;
            const isRegular = !bookingTimeSlot.status;

            const isJoined =
              isAuthenticated &&
              !isRegular &&
              bookingTimeSlot.userOnBookingTimeSlots.some(
                (slot) => slot.userId === user.id
              );

            const dateOfClass =
              startOfDay(new Date(query.date)).getTime() + startTime;

            const nowPlusHours = add(new Date(), {
              hours: HOURS,
            }).getTime();

            const shouldDisabled =
              isPast(dateOfClass) || nowPlusHours > dateOfClass;

            return (
              <div
                key={slot.id}
                className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg text-white"
              >
                <div className="space-y-2">
                  <div className="text-2xl flex items-center space-x-2">
                    {!isRegular &&
                      bookingTimeSlot.status ===
                        BookingTimeSlotStatusEnum.CONFIRM && (
                        <CheckIcon bg="green.600" rounded="full" p="1" />
                      )}
                    <span className="font-semibold">{slot.className}</span>
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
                          {bookingTimeSlot.userOnBookingTimeSlots.map(
                            (slot, index) => (
                              <div key={index}>
                                <div className="w-10 h-10 relative">
                                  <Image
                                    src={
                                      slot.user.profileImg ?? DefaultProfileImg
                                    }
                                    alt={`${slot.user.username} profile image`}
                                    className="w-full h-full rounded-full object-cover"
                                    fill
                                  />
                                </div>
                                <div>{slot.user.username}</div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    {!isRegular && !!bookingTimeSlot.coach && (
                      <div className="">
                        {t("classes:coaches")}
                        {": "}
                        {bookingTimeSlot.coach.username}
                      </div>
                    )}
                    {isRegular &&
                      regularBookingTimeSlot.coach &&
                      !!regularBookingTimeSlot.coach.username && (
                        <div className="">
                          {t("classes:coaches")}
                          {": "}
                          {regularBookingTimeSlot.coach.username}
                        </div>
                      )}
                  </div>
                  <div className="self-end">
                    {isJoined ? (
                      <MinusIcon
                        bg={!shouldDisabled ? "red.600" : "gray.500"}
                        rounded="full"
                        p="1.5"
                        className={`text-2xl ${
                          !shouldDisabled && "cursor-pointer"
                        }`}
                        onClick={async () => {
                          if (shouldDisabled) {
                            return;
                          }
                          await leaveClass(slot as BookingTimeSlots);
                        }}
                      />
                    ) : (
                      <AddIcon
                        bg={!shouldDisabled ? "green.600" : "gray.500"}
                        rounded="full"
                        p="1.5"
                        className={`text-2xl ${
                          !shouldDisabled && "cursor-pointer"
                        }`}
                        onClick={async () => {
                          if (shouldDisabled) {
                            return;
                          }
                          if (!lessonsData || lessonsData.length === 0) {
                            handleOpenModel();
                            return;
                          }
                          if (isRegular) {
                            await joinRegularClass(
                              slot as RegularBookingTimeSlots
                            );
                            return;
                          }
                          await joinClass(slot as BookingTimeSlots);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {data.bookingTimeSlots.length !== 0 ? (
            <PaginationSection
              setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
              query={query}
              totalCount={data.totalClassesCount}
            />
          ) : data.regularBookingSlot.length === 0 ? (
            <div className="text-white text-center">{t("admin:no_data")}</div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          isAuthenticated ? (
            modelType === OpenModelType.REQUEST_LESSON_MESSAGE ? (
              <div>
                <p className="text-center">
                  {t("request_class_message")}
                  <span className="font-medium hover:font-semibold cursor-pointer">
                    {t("contact_coach")}
                  </span>
                </p>
              </div>
            ) : (
              <CreateRequestedClassForm
                modalDisclosure={modalDisclosure}
                date={date}
              />
            )
          ) : (
            <>
              {modelType === OpenModelType.SIGN_UP && (
                <SignUpForm
                  LoginButton={
                    <button
                      className="text-blue-700 underline hover:text-blue-800"
                      onClick={() => {
                        setModelType(OpenModelType.LOGIN);
                      }}
                    >
                      {t("auth:login.login")}
                    </button>
                  }
                />
              )}
              {modelType === OpenModelType.LOGIN && (
                <LoginForm
                  SignUpButton={
                    <button
                      className="text-blue-700 underline hover:text-blue-800"
                      onClick={() => {
                        setModelType(OpenModelType.SIGN_UP);
                      }}
                    >
                      {t("auth:sign_up.sign_up")}
                    </button>
                  }
                />
              )}
            </>
          )
        }
      />
    </>
  );
};

export default ClassesPage;
