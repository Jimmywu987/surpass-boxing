import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays, endOfDay, format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import { LoginForm } from "@/features/login/components/LoginForm";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";

import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { useSession } from "next-auth/react";
import {
  User,
  BookingTimeSlots,
  RegularBookingTimeSlots,
  BookingTimeSlotStatusEnum,
  UserOnBookingTimeSlots,
} from "@prisma/client";

import { ModalComponent } from "@/features/common/components/Modal";
import { CreateBookingTimeSlotForm } from "@/features/classes/components/CreateBookingTimeSlotForm";
import { useBookingTimeSlotForStudentQuery } from "@/apis/api";
import { SKIP_NUMBER, TAKE_NUMBER } from "@/constants";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
import { getTimeDuration } from "@/helpers/getTime";
import { getDuration } from "@/helpers/getDuration";
const ClassesPage = () => {
  const { t, lang } = useTranslation("classes");
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const [modelType, setModelType] = useState(OpenModelType.OPEN_CLASS);
  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const handleOpenModel = (type: OpenModelType) => {
    if (!isAuthenticated) {
      setModelType(OpenModelType.SIGN_UP);
    } else {
      setModelType(type);
    }
    onOpen();
  };
  const [query, setQuery] = useState({
    skip: 0,
    date: new Date(),
  });
  const minDate = endOfDay(subDays(new Date(), 1));
  const { data, isLoading } = useBookingTimeSlotForStudentQuery(query);
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

  console.log("classes", classes);
  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-white text-3xl">{t("classes")}</h1>
        <div className="flex space-x-2 items-center">
          <div className="w-36">
            <SingleDatepicker
              name="date-input"
              date={query.date}
              onDateChange={(value) => {
                setQuery(() => ({ skip: 0, date: value }));
              }}
              minDate={minDate}
              propsConfigs={{
                dayOfMonthBtnProps: {
                  defaultBtnProps: {
                    borderColor: "gray.800",
                    _hover: {
                      background: "blue.400",
                    },
                  },
                  selectedBtnProps: {
                    background: "#EE72B6",
                  },
                  todayBtnProps: {
                    background: "teal.600",
                  },
                },
                inputProps: {
                  color: "white",
                  size: "sm",
                  cursor: "pointer",
                },
                popoverCompProps: {
                  popoverContentProps: {
                    background: "gray.700",
                    color: "white",
                  },
                },
              }}
            />
          </div>
          <div className="text-white">
            {t(format(query.date, "EEEE").toLowerCase())}
          </div>
          <div>
            <Button onClick={() => handleOpenModel(OpenModelType.OPEN_CLASS)}>
              {t("open_a_class")}
            </Button>
          </div>
        </div>
        <div>
          {classes.map((slot) => {
            const { startTime, endTime } = slot;
            const bookingTimeSlot = slot as BookingTimeSlots & {
              userOnBookingTimeSlots: (UserOnBookingTimeSlots & {
                user: {
                  username: string;
                  profileImg: string;
                };
              })[];
            };

            const regularBookingTimeSlot = slot as RegularBookingTimeSlots & {
              coach: {
                username: string;
              };
            };
            const isRegular = !bookingTimeSlot.status;

            return (
              <div
                key={slot.id}
                className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-500 cursor-pointer text-white"
                onClick={() => handleOpenModel(OpenModelType.VIEW_CLASS)}
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
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    {!isRegular && !!bookingTimeSlot.coachName && (
                      <div className="">
                        {t("classes:coaches")}
                        {": "}
                        {bookingTimeSlot.coachName}
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
                    {!isRegular &&
                      bookingTimeSlot.userOnBookingTimeSlots.map(
                        (slot, index) => {
                          return (
                            <div key={index}>
                              <div>{slot.user.username}</div>
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
                            </div>
                          );
                        }
                      )}
                    {!isRegular && !!slot.numberOfParticipants && (
                      <div>
                        {t("classes:set_limit")}
                        {": "}
                        {`${bookingTimeSlot.userOnBookingTimeSlots.length} /${slot.numberOfParticipants}`}
                      </div>
                    )}
                    {!isRegular && !slot.numberOfParticipants && (
                      <div>
                        {t("classes:number_of_participants")}
                        {": "}
                        {`${bookingTimeSlot.userOnBookingTimeSlots.length}`}
                      </div>
                    )}
                  </div>
                </div>
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
          ) : data.regularBookingSlot.length === 0 ? (
            <div>{t("admin:no_data")}</div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          isAuthenticated ? (
            modelType === OpenModelType.OPEN_CLASS ? (
              <CreateBookingTimeSlotForm />
            ) : (
              <div></div>
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
