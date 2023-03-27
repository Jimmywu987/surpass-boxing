import { useUpdateClassStatus } from "@/apis/api";
import { getDuration } from "@/helpers/getDuration";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

import DefaultProfileImg from "@/../public/default-profile-img.png";
import { getTimeDisplay } from "@/helpers/getTime";
import { timeSlotSelector, updateTimeSlot } from "@/redux/timeSlot";
import { CheckIcon } from "@chakra-ui/icons";
import { format, intervalToDuration } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditRequestedClassForm } from "@/features/admin/components/form/EditRequestedClassForm";
import { useQueryClient } from "react-query";

export const ViewRequestedClass = ({
  modalDisclosure,
  isPast,
}: {
  modalDisclosure: UseDisclosureReturn;
  isPast: boolean;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isEdit, setIsEdit] = useState(false);
  const { timeSlot } = useSelector(timeSlotSelector);

  const { mutateAsync, isLoading } = useUpdateClassStatus();
  if (!timeSlot) {
    return <></>;
  }
  const session = useSession();
  const user = session.data?.user as User;
  const startTime = intervalToDuration({
    start: 0,
    end: timeSlot.startTime,
  });
  const endTime = intervalToDuration({
    start: 0,
    end: timeSlot.endTime,
  });

  const updateClassStatus = async (status: BookingTimeSlotStatusEnum) => {
    await mutateAsync({
      status,
      id: timeSlot.id,
    });
    dispatch(updateTimeSlot({ timeSlot: { ...timeSlot, status } }));
    queryClient.invalidateQueries("requestedClass");
  };
  const dateTime = new Date(timeSlot.date);
  return (
    <div>
      {!isPast && (
        <div>
          <button
            onClick={() => {
              setIsEdit((e) => !e);
            }}
            className={`px-2 py-1 ${
              isEdit ? "bg-gray-400" : "bg-gray-700"
            } rounded text-white`}
          >
            {t("common:action.update")}
          </button>
        </div>
      )}
      <div className=" font-semibold  border-gray-600">
        {`${format(dateTime, "yyyy-MM-dd")} ${t(
          `classes:${format(dateTime, "EEEE").toLowerCase()}`
        )}`}
      </div>
      {isEdit ? (
        <EditRequestedClassForm
          timeSlot={timeSlot}
          modalDisclosure={modalDisclosure}
        />
      ) : (
        <div className="flex flex-col py-2 space-y-5">
          <div className="flex">
            <div className="space-y-2">
              <div className="text-2xl flex items-center space-x-2">
                {timeSlot.status === BookingTimeSlotStatusEnum.CONFIRM && (
                  <CheckIcon
                    bg="green.600"
                    rounded="full"
                    p="1"
                    textColor="white"
                  />
                )}

                <span className="font-semibold">{timeSlot.className}</span>
                {timeSlot.status === BookingTimeSlotStatusEnum.CANCELED && (
                  <span className="text-sm bg-gray-400 text-white px-2 py-1 rounded">
                    {t("classes:canceled")}
                  </span>
                )}
              </div>

              <div>
                {getTimeDisplay(startTime.hours ?? 0, startTime.minutes ?? 0)}
                {" - "}
                {getTimeDisplay(endTime.hours ?? 0, endTime.minutes ?? 0)}
                <div>
                  {t("classes:duration")}:{" "}
                  {t(
                    ...(getDuration(timeSlot.startTime, timeSlot.endTime) as [
                      string
                    ])
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-3">
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
          <div className="space-y-3 flex flex-wrap">
            {timeSlot.userOnBookingTimeSlots.map((user) => (
              <Link
                key={user.userId}
                href={`/profile/${user.userId}`}
                passHref
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <div className="w-8 h-8 relative">
                  <Image
                    src={user.user.profileImg ?? DefaultProfileImg}
                    alt={`${user.user.username} profile image`}
                    className="w-full h-full rounded-full object-cover"
                    fill
                  />
                </div>
                <span className="truncate w-[4.5rem] group-hover:text-gray-500">
                  {user.user.username}
                </span>
              </Link>
            ))}
          </div>
          {!isPast && (
            <div className="space-x-2 self-end">
              <button
                className={`px-4 py-1 ${
                  timeSlot.status !== BookingTimeSlotStatusEnum.PENDING
                    ? "bg-gray-300"
                    : "bg-green-500"
                }  rounded text-white`}
                disabled={
                  timeSlot.status !== BookingTimeSlotStatusEnum.PENDING ||
                  isLoading
                }
                onClick={() =>
                  updateClassStatus(BookingTimeSlotStatusEnum.CONFIRM)
                }
              >
                {t("admin:action.confirm")}
              </button>
              <button
                className={`px-4 py-1 ${
                  timeSlot.status === BookingTimeSlotStatusEnum.CANCELED
                    ? "bg-gray-300"
                    : "bg-red-500"
                } rounded text-white`}
                disabled={
                  timeSlot.status === BookingTimeSlotStatusEnum.CANCELED ||
                  isLoading
                }
                onClick={() =>
                  updateClassStatus(BookingTimeSlotStatusEnum.CANCELED)
                }
              >
                {t("admin:action.cancel")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
