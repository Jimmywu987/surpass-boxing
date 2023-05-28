import { cn } from "@/utils/cn";
import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useGetNotificationRecord } from "@/features/admin/hooks/useGetNotificationRecord";
import { Button, useDisclosure } from "@chakra-ui/react";
import { ModalComponent } from "@/features/common/components/Modal";

export const AdminNotification = () => {
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const { onOpen, onClose } = modalDisclosure;
  const utils = trpc.useContext();

  const { records } = useGetNotificationRecord();
  const { mutateAsync, isLoading } = trpc.notificationRouter.remove.useMutation(
    {
      onSuccess: () => {
        utils.notificationRouter.fetch.invalidate();
      },
    }
  );
  const { mutateAsync: mutateAsyncRemoveAll, isLoading: isLoadingRemoveAll } =
    trpc.notificationRouter.removeAll.useMutation({
      onSuccess: () => {
        utils.notificationRouter.fetch.invalidate();
        onClose();
      },
    });
  const removeNotification = async ({ id }: { id: string }) => {
    if (!isLoading) {
      try {
        await mutateAsync({ id });
      } catch (error) {}
    }
  };
  if (!records || records.length === 0)
    return (
      <div className="text-center w-full">
        <p>{t("no_notification")}</p>
      </div>
    );
  return (
    <>
      <div className="w-full space-y-3">
        <div>
          <Button
            onClick={async () => {
              onOpen();
            }}
            colorScheme="whiteAlpha"
            variant="solid"
            disabled={isLoadingRemoveAll}
          >
            {t("remove_all_notification")}
          </Button>
        </div>
        {records.map((each, index) => {
          const { date, records } = each;
          return (
            <div key={index}>
              <div className="text-lg font-semibold p-3 border border-gray-600">
                {`${date} ${t(
                  `classes:${format(new Date(date), "EEEE").toLowerCase()}`
                )}`}
              </div>
              {records.map((notification, index) => (
                <div key={index} className="border-b border-b-gray-600 p-2 ">
                  <div className="flex justify-between">
                    <p className="whitespace-pre-wrap text-xl">
                      {notification.message}
                    </p>
                    <SmallCloseIcon
                      className={cn(
                        "text-2xl ",
                        isLoading ? "bg-gray-300" : "cursor-pointer bg-black"
                      )}
                      onClick={async () => {
                        await removeNotification({ id: notification.id });
                      }}
                    />
                  </div>
                  <p>
                    {format(notification.createdAt, "yyyy-MM-dd, HH:mm:ss")}
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <div className="w-full md:w-80 space-y-4">
            <p>{t("are_you_sure_remove_all")}</p>
            <div className="flex space-x-2">
              <button
                className={cn("rounded text-white px-4 py-1 bg-gray-300")}
                disabled={isLoadingRemoveAll || isLoading}
                onClick={() => onClose()}
              >
                {t("admin:action.cancel")}
              </button>
              <button
                className={cn("px-4 py-1 rounded text-white bg-red-500")}
                disabled={isLoadingRemoveAll || isLoading}
                onClick={async () => await mutateAsyncRemoveAll()}
              >
                {t("admin:action.confirm")}
              </button>
            </div>
          </div>
        }
      />
    </>
  );
};
