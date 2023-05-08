import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

export const AdminNotification = () => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();

  const { data } = trpc.notificationRouter.fetch.useQuery();
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
  if (!data || data.length === 0)
    return (
      <div className="text-center w-full">
        <p>{t("no_notification")}</p>
      </div>
    );
  return (
    <div className="w-full">
      {data.map((notification, index) => (
        <div key={index} className="space-y-2 border-b border-b-gray-600 py-2">
          <div className="flex justify-between">
            <SmallCloseIcon
              className={`${
                isLoading ? "bg-gray-300" : "cursor-pointer bg-black"
              } text-2xl `}
              onClick={async () => {
                await removeNotification({ id: notification.id });
              }}
            />
          </div>
          <p className="whitespace-pre-wrap">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
