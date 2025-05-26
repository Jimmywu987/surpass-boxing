import { getDuration } from "@/helpers/getDuration";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

import DefaultProfileImg from "@/../public/default-profile-img.png";
import { getTimeDuration } from "@/helpers/getTime";
import { timeSlotSelector, updateTimeSlot } from "@/redux/timeSlot";
import { CheckIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditRequestedClassForm } from "@/features/admin/components/form/EditRequestedClassForm";

import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/cn";

export const ViewRequestedClass = ({
  modalDisclosure,
  isPast,
}: {
  modalDisclosure: UseDisclosureReturn;
  isPast: boolean;
}) => {
  const [onConfirmCancel, setOnConfirmCancel] = useState(false);
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const utils = trpc.useContext();
  const [isEdit, setIsEdit] = useState(false);
  const { timeSlot } = useSelector(timeSlotSelector);

  const statusUpdateMutation =
    trpc.classRouter.requestedClassRouter.statusUpdate.useMutation();
  const resumeClassMutation =
    trpc.classRouter.requestedClassRouter.resumeClass.useMutation();
  if (!timeSlot) {
    return <></>;
  }
  const { startTime, endTime, status } = timeSlot;

  const updateClassStatus = async (status: BookingTimeSlotStatusEnum) => {
    await statusUpdateMutation.mutateAsync({
      status,
      id: timeSlot.id,
    });
    dispatch(updateTimeSlot({ timeSlot: { ...timeSlot, status } }));
    utils.classRouter.requestedClassRouter.fetch.invalidate();
  };
  const dateTime = new Date(timeSlot.date);
  const isLoading =
    statusUpdateMutation.isLoading || resumeClassMutation.isLoading;
  return (
    <div>
      {!isPast && status !== BookingTimeSlotStatusEnum.CANCELED && (
        <div>
          <button
            onClick={() => {
              setIsEdit((e) => !e);
            }}
            className={cn(
              "px-2 py-1 rounded text-white",
              isEdit ? "bg-gray-400" : "bg-gray-700"
            )}
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
                {status === BookingTimeSlotStatusEnum.CONFIRM && (
                  <CheckIcon
                    bg="green.600"
                    rounded="full"
                    p="1"
                    textColor="white"
                  />
                )}

                <span className="font-semibold">{timeSlot.className}</span>
                {status === BookingTimeSlotStatusEnum.CANCELED && (
                  <span className="text-sm bg-gray-400 text-white px-2 py-1 rounded">
                    {t("classes:canceled")}
                  </span>
                )}
              </div>

              <div>
                {getTimeDuration({ startTime, endTime })}
                <div>
                  {t("classes:duration")}:{" "}
                  {t(...(getDuration({ startTime, endTime }) as [string]))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-3">
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
          {!isPast &&
            (!onConfirmCancel ? (
              <div className="flex space-x-2 justify-between">
                {status !== BookingTimeSlotStatusEnum.CANCELED && (
                  <button
                    className={cn("rounded text-white px-4 py-1 bg-red-500")}
                    disabled={isLoading}
                    onClick={() => setOnConfirmCancel(true)}
                  >
                    {t("admin:action.cancel")}
                  </button>
                )}
                {status === BookingTimeSlotStatusEnum.CANCELED && (
                  <button
                    className={cn("px-4 py-1 rounded text-white bg-green-500")}
                    disabled={isLoading}
                    onClick={async () => {
                      await resumeClassMutation.mutateAsync({
                        id: timeSlot.id,
                      });
                      dispatch(
                        updateTimeSlot({
                          timeSlot: {
                            ...timeSlot,
                            status: BookingTimeSlotStatusEnum.PENDING,
                          },
                        })
                      );
                      utils.classRouter.requestedClassRouter.fetch.invalidate();
                    }}
                  >
                    {t("admin:action.resume_class")}
                  </button>
                )}
                {status === BookingTimeSlotStatusEnum.PENDING && (
                  <button
                    className={cn("px-4 py-1 rounded text-white bg-green-500")}
                    disabled={isLoading}
                    onClick={() =>
                      updateClassStatus(BookingTimeSlotStatusEnum.CONFIRM)
                    }
                  >
                    {t("admin:action.confirm")}
                  </button>
                )}
                {status === BookingTimeSlotStatusEnum.CONFIRM && (
                  <button
                    className={cn("px-4 py-1 rounded text-white bg-gray-700")}
                    disabled={isLoading}
                    onClick={() =>
                      updateClassStatus(BookingTimeSlotStatusEnum.PENDING)
                    }
                  >
                    {t("admin:action.pending")}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <p className="font-medium text-center">
                  {t("admin:confirming_cancel_class")}
                </p>
                <div className="flex space-x-2 justify-between">
                  <button
                    className={cn("rounded text-white px-4 py-1  bg-gray-700")}
                    onClick={() => setOnConfirmCancel(false)}
                  >
                    {t("admin:action.return")}
                  </button>

                  <button
                    className={cn("px-4 py-1 rounded text-white bg-red-500")}
                    disabled={isLoading}
                    onClick={() => {
                      updateClassStatus(BookingTimeSlotStatusEnum.CANCELED);
                      setOnConfirmCancel(false);
                    }}
                  >
                    {t("admin:action.confirm_cancel")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
