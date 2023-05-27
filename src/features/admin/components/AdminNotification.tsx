import { cn } from "@/utils/cn";
import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useGetNotificationRecord } from "@/features/admin/hooks/useGetNotificationRecord";

export const AdminNotification = () => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();

  const { records } = useGetNotificationRecord();
  const { mutateAsync, isLoading } = trpc.notificationRouter.remove.useMutation(
    {
      onSuccess: () => {
        utils.notificationRouter.fetch.invalidate();
      },
    }
  );
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
    <div className="w-full space-y-3">
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
                <p>{format(notification.createdAt, "yyyy-MM-dd, HH:mm:ss")}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
