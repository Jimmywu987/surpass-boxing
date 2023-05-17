import { AdminJoinLevelEnums } from "@/features/admin/enums/AdminOptionEnums";
import { useGetClassLevelRecord } from "@/features/admin/hooks/useGetClassLevelRecord";
import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

export const AdminClassLevelRecord = () => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();
  const { joinLevelFilter, setJoinLevelFilter, levelRecords } =
    useGetClassLevelRecord();

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

  return (
    <div className="w-full space-y-3">
      <div className=" space-x-3">
        <Button
          colorScheme="whiteAlpha"
          variant={
            joinLevelFilter === AdminJoinLevelEnums.ALL ? "solid" : "outline"
          }
          onClick={() => {
            setJoinLevelFilter(AdminJoinLevelEnums.ALL);
          }}
        >
          {t("all")}
        </Button>
        <Button
          colorScheme="whiteAlpha"
          variant={
            joinLevelFilter === AdminJoinLevelEnums.JOIN_LOWER_LEVEL
              ? "solid"
              : "outline"
          }
          onClick={() => {
            setJoinLevelFilter(AdminJoinLevelEnums.JOIN_LOWER_LEVEL);
          }}
        >
          {t("join_lower_level")}
        </Button>
        <Button
          colorScheme="whiteAlpha"
          variant={
            joinLevelFilter === AdminJoinLevelEnums.JOIN_HIGHER_LEVEL
              ? "solid"
              : "outline"
          }
          onClick={() => {
            setJoinLevelFilter(AdminJoinLevelEnums.JOIN_HIGHER_LEVEL);
          }}
        >
          {t("join_higher_level")}
        </Button>
      </div>
      <div className="border-t border-t-gray-600">
        {levelRecords.length > 0 ? (
          levelRecords.map((each, index) => {
            const { date, records } = each;
            return (
              <div key={index}>
                <div className="text-lg font-semibold p-3 border border-gray-600">
                  {`${date} ${t(
                    `classes:${format(new Date(date), "EEEE").toLowerCase()}`
                  )}`}
                </div>
                {records.map((record, index) => {
                  const levelFrom = t(
                    `classes:${record.levelFrom.toLowerCase()}`
                  );
                  const levelTo = t(`classes:${record.levelTo.toLowerCase()}`);
                  const { username } = record.user;
                  return (
                    <div
                      key={index}
                      className="border-b border-b-gray-600 p-2 "
                    >
                      <div className="flex justify-between">
                        <div className="flex">
                          <p className="whitespace-pre-wrap text-xl">
                            {t("different_level_text", {
                              username,
                              levelFrom,
                              levelTo,
                            })}
                          </p>
                        </div>
                        <SmallCloseIcon
                          className={`${
                            isLoading
                              ? "bg-gray-300"
                              : "cursor-pointer bg-black"
                          } text-2xl `}
                          onClick={async () => {
                            await removeRecord({ id: record.id });
                          }}
                        />
                      </div>
                      <div>
                        {levelFrom} {"->"} {levelTo}
                      </div>
                      <p className="">
                        {format(record.createdAt, "yyyy-MM-dd, HH:mm:ss")}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center w-full my-6">
            <p>{t("no_record")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
