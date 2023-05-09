import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

export const AdminClassLevelRecord = () => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();

  const { data } = trpc.classRouter.levelRecordRouter.fetch.useQuery();
  const { mutateAsync, isLoading } =
    trpc.classRouter.levelRecordRouter.remove.useMutation({
      onSuccess: () => {
        utils.classRouter.levelRecordRouter.fetch.invalidate();
      },
    });
  const removeRecord = async ({ id }: { id: string }) => {
    if (!isLoading) {
      try {
        await mutateAsync({ id });
      } catch (error) {}
    }
  };
  if (!data || data.length === 0)
    return (
      <div className="text-center w-full">
        <p>{t("no_record")}</p>
      </div>
    );
  return (
    <div className="w-full">
      {data.map((record, index) => (
        <div key={index} className="border-b border-b-gray-600 py-2 ">
          <div className="flex justify-between">
            <div className="flex">
              <p className="whitespace-pre-wrap text-xl">
                {record.user.username}
              </p>
              <p className="whitespace-pre-wrap text-xl">{record.levelFrom}</p>
              <p className="whitespace-pre-wrap text-xl">{record.levelTo}</p>
            </div>

            <SmallCloseIcon
              className={`${
                isLoading ? "bg-gray-300" : "cursor-pointer bg-black"
              } text-2xl `}
              onClick={async () => {
                await removeRecord({ id: record.id });
              }}
            />
          </div>
          <p className="">{format(record.createdAt, "yyyy-MM-dd, HH:mm:ss")}</p>
        </div>
      ))}
    </div>
  );
};
