import { ModalComponent } from "@/features/common/components/Modal";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { Button, useDisclosure } from "@chakra-ui/react";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

import { SetOffDayForm } from "@/features/admin/components/form/SetOffDayForm";
import { trpc } from "@/utils/trpc";

export const AdminSetOffDay = () => {
  const { t } = useTranslation("admin");

  const modalDisclosure = useDisclosure();

  const utils = trpc.useContext();

  const { onOpen } = modalDisclosure;
  const { data, isLoading } = trpc.offDayRouter.fetch.useQuery();
  const {
    mutateAsync: mutateAsyncRemoveAllPast,
    isLoading: isLoadingRemoveAllPast,
  } = trpc.offDayRouter.removeAllPast.useMutation();
  const { mutateAsync, isLoading: isLoadingRemoveOne } =
    trpc.offDayRouter.remove.useMutation({
      onSuccess: () => {
        utils.offDayRouter.fetch.invalidate();
      },
    });
  const handleOpenModel = () => {
    onOpen();
  };
  const disabled = isLoading || isLoadingRemoveOne || isLoadingRemoveAllPast;
  return (
    <>
      <div className="w-full space-y-2">
        <div className="border-b border-b-gray-600 py-2 flex space-x-2">
          <Button
            onClick={() => {
              handleOpenModel();
            }}
            colorScheme="whiteAlpha"
            variant="solid"
          >
            {t("add_day_off")}
          </Button>
          <Button
            onClick={() => {
              mutateAsyncRemoveAllPast();
            }}
            colorScheme="whiteAlpha"
            variant="solid"
            disabled={disabled}
          >
            {t("delete_past_off_day")}
          </Button>
        </div>
        <div>
          {data && data.length > 0 ? (
            data.map(({ id, date, reason, createdAt }, index) => (
              <div
                key={index}
                className="space-y-2 border-b border-b-gray-600 py-2"
              >
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold">{`${format(
                      date,
                      "yyyy-MM-dd"
                    )} ${t(
                      `classes:${format(date, "EEEE").toLowerCase()}`
                    )}`}</h2>

                    <SmallCloseIcon
                      className={`${
                        isLoading ? "bg-gray-300" : "cursor-pointer bg-black"
                      } text-2xl `}
                      onClick={async () => {
                        await mutateAsync({ id });
                      }}
                    />
                  </div>
                  <p className="text-lg">{reason}</p>
                </div>
                <p>{format(createdAt, "yyyy-MM-dd, HH:mm:ss")}</p>
              </div>
            ))
          ) : (
            <div className="text-center w-full">
              <p>{t("no_day_off")}</p>
            </div>
          )}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={<SetOffDayForm modalDisclosure={modalDisclosure} />}
      />
    </>
  );
};
