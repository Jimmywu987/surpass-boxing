import { SmallCloseIcon } from "@chakra-ui/icons";
import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";

import {
  useRegularClassQuery,
  useRemoveRegularClassMutation,
} from "@/apis/api";
import { ModalComponent } from "@/features/common/components/Modal";
import { WEEK_NAMES } from "@/features/common/constants/weekNames";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { intervalToDuration } from "date-fns";
import { useQueryClient } from "react-query";
import { CreateRegularClassForm } from "@/features/admin/components/form/CreateRegularClassForm";

export const AdminRegularClass = () => {
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading: removeRegularClassIsLoading } =
    useRemoveRegularClassMutation();
  const { data, isLoading } = useRegularClassQuery();

  const { onOpen } = modalDisclosure;

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
  const handleRegularClassRemove = async (id: string) => {
    if (!removeRegularClassIsLoading) {
      await mutateAsync({ id });
      queryClient.invalidateQueries("regularClass");
    }
  };
  return (
    <div>
      <div className="space-y-4">
        <Button
          onClick={handleOpenModel}
          colorScheme="whiteAlpha"
          variant="solid"
        >
          {t("add_regular_class")}
        </Button>
        <div className="space-y-1">
          {data.regularBookingTimeSlots.map((timeSlot) => {
            const { startTime, endTime } = timeSlot;

            return (
              <div
                key={timeSlot.id}
                className="flex  justify-between p-5 border border-gray-600 rounded-md  shadow-lg"
              >
                <div className="space-y-2">
                  <div className="text-2xl font-semibold">
                    {timeSlot.className}
                  </div>
                  <div className="flex flex-wrap space-x-6">
                    {WEEK_NAMES.map((weekName, indx) => {
                      return (
                        <div key={indx} className="flex items-center space-x-2">
                          <div
                            className={`rounded-full w-1 h-1 ${
                              timeSlot[weekName as "monday"]
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span>{t(`classes:${weekName}`)}</span>
                        </div>
                      );
                    })}
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
                  <SmallCloseIcon
                    onClick={() => handleRegularClassRemove(timeSlot.id)}
                    textColor="gray.800"
                    bg="white"
                    rounded="full"
                    alignSelf="end"
                    cursor="pointer"
                  />
                  <div>
                    <div className="">
                      {t("classes:coaches")}
                      {": "}
                      {timeSlot.coach.username}
                    </div>
                    <div>
                      {t("classes:set_limit")}
                      {": "}
                      {timeSlot.numberOfParticipants ?? t("not_limited")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={<CreateRegularClassForm modalDisclosure={modalDisclosure} />}
      />
    </div>
  );
};
