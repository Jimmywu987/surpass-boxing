import { SmallCloseIcon } from "@chakra-ui/icons";
import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";

import { CreateRegularClassForm } from "@/features/admin/components/form/CreateRegularClassForm";
import { HideRegularClassForm } from "@/features/admin/components/form/HideRegularClassForm";
import { ModalComponent } from "@/features/common/components/Modal";
import { WeekEnums } from "@/features/common/enums/WeekEnums";
import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { format } from "date-fns";

export const AdminRegularClass = () => {
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const [regularClassId, setRegularClassId] = useState<string | null>(null);
  const utils = trpc.useContext();
  const { mutateAsync, isLoading: removeRegularClassIsLoading } =
    trpc.classRouter.regularClassRouter.remove.useMutation({
      onSuccess: () => {
        utils.classRouter.regularClassRouter.fetch.invalidate();
      },
    });
  const { data, isLoading } =
    trpc.classRouter.regularClassRouter.fetch.useQuery();

  const {
    mutateAsync: removeHideRegularClassMutateAsync,
    isLoading: removeHideRegularClassIsLoading,
  } = trpc.classRouter.regularClassRouter.removeHide.useMutation({
    onSuccess: () => {
      utils.classRouter.regularClassRouter.fetch.invalidate();
    },
  });

  const { onOpen } = modalDisclosure;

  const handleOpenModel = (id: string | null) => {
    setRegularClassId(id);
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
    }
  };
  const handleHideRegularClassRemove = async (id: string) => {
    if (!removeHideRegularClassIsLoading) {
      await removeHideRegularClassMutateAsync({ id });
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <Button
          onClick={() => handleOpenModel(null)}
          colorScheme="whiteAlpha"
          variant="solid"
        >
          {t("add_regular_class")}
        </Button>

        <div className="space-y-1">
          {data.map((timeSlot) => {
            const { startTime, endTime, id, cancelRegularBookingTimeSlot } =
              timeSlot;

            return (
              <div
                key={timeSlot.id}
                className="flex flex-col p-3 md:p-5 border border-gray-600 rounded-md shadow-lg space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-semibold">
                    {timeSlot.className} (
                    {t(`classes:${timeSlot.level.toLowerCase()}`)})
                  </div>
                  <SmallCloseIcon
                    onClick={() => handleRegularClassRemove(timeSlot.id)}
                    textColor="gray.800"
                    bg="white"
                    rounded="full"
                    alignSelf="end"
                    cursor="pointer"
                  />
                </div>
                <div className="flex flex-col md:flex-row md:justify-between space-y-2 md:space-y-0">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 md:gap-4 ">
                      {Object.values(WeekEnums).map((weekDay, indx) => {
                        return (
                          <div
                            key={indx}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={`rounded-full w-1 h-1 ${
                                timeSlot[weekDay]
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            />
                            <span>{t(`classes:${weekDay}`)}</span>
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

                  <div className="md:self-end">
                    <div>
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
                <div className="space-y-2">
                  <Button
                    onClick={() => handleOpenModel(id)}
                    colorScheme="whiteAlpha"
                    variant="solid"
                  >
                    {t("remove_regular_class_on_specific_date")}
                  </Button>
                  <div className="flex gap-2 flex-wrap">
                    {cancelRegularBookingTimeSlot.map(({ id, date }) => {
                      return (
                        <div
                          key={id}
                          className="text-lg font-semibold p-3 border border-gray-600 space-x-3 items-center flex"
                        >
                          <p>{`${format(new Date(date), "yyyy-MM-dd")}`}</p>
                          <SmallCloseIcon
                            onClick={() => handleHideRegularClassRemove(id)}
                            textColor="gray.800"
                            bg="white"
                            rounded="full"
                            cursor="pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          !regularClassId ? (
            <CreateRegularClassForm modalDisclosure={modalDisclosure} />
          ) : (
            <HideRegularClassForm
              modalDisclosure={modalDisclosure}
              timeSlotId={regularClassId}
            />
          )
        }
      />
    </div>
  );
};
