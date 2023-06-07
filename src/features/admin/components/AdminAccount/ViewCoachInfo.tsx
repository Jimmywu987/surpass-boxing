import { trpc } from "@/utils/trpc";
import { ChevronLeftIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Button, Input, Skeleton, Spinner, Stack } from "@chakra-ui/react";

import useTranslation from "next-translate/useTranslation";
import { useRef } from "react";

export const ViewCoachInfo = ({
  onClick,
  userId,
}: {
  onClick: () => void;
  userId: string;
}) => {
  const { t } = useTranslation("coaches");
  const utils = trpc.useContext();

  const { data, isLoading } = trpc.coachInfosRouter.fetch.useQuery({ userId });
  const {
    mutateAsync: addCoachInfoMutateAsync,
    isLoading: addCoachInfoIsLoading,
  } = trpc.coachInfosRouter.addTitle.useMutation({
    onSuccess: async () => {
      utils.coachInfosRouter.fetch.invalidate();
    },
  });
  const {
    mutateAsync: removeCoachInfoMutateAsync,
    isLoading: removeCoachInfoIsLoading,
  } = trpc.coachInfosRouter.remove.useMutation({
    onSuccess: async () => {
      utils.coachInfosRouter.fetch.invalidate();
    },
  });
  const zhTitleRef = useRef<HTMLInputElement>(null);
  const enTitleRef = useRef<HTMLInputElement>(null);
  const handleTitleAdd = async () => {
    if (zhTitleRef && zhTitleRef.current && zhTitleRef.current.value) {
      const zhTitle = zhTitleRef.current.value;
      const enTitle = !!enTitleRef?.current?.value
        ? enTitleRef.current.value
        : null;

      await addCoachInfoMutateAsync({ zhTitle, enTitle, userId });
      zhTitleRef.current.value = "";
      if (enTitleRef && enTitleRef.current && enTitleRef.current.value) {
        enTitleRef.current.value = "";
      }
    }
  };
  const handleTitleRemove = async (coachInfoId: string) => {
    await removeCoachInfoMutateAsync({ id: coachInfoId });
  };
  if (!data || isLoading) {
    return (
      <Stack className="w-full md:w-[280px]">
        <Skeleton h="40px" />
        <div className="space-y-1">
          <Skeleton h="35px" />
          <Skeleton h="35px" />
        </div>
      </Stack>
    );
  }
  return (
    <div>
      <ChevronLeftIcon fontSize="3xl" cursor="pointer" onClick={onClick} />
      <div className="space-y-3 mt-4">
        <div className="flex flex-col space-y-2">
          <p className="font-semibold text-lg">{t("title")}</p>
          <div className="flex bg-white rounded ">
            <Input
              type="text"
              placeholder={`${t("zh")} (${t("required")})`}
              bg="white"
              textColor="gray.800"
              ref={zhTitleRef}
            />
          </div>
          <div className="flex bg-white rounded ">
            <Input
              type="text"
              placeholder={t("en")}
              bg="white"
              textColor="gray.800"
              ref={enTitleRef}
            />
          </div>
          <Button
            size="sm"
            onClick={handleTitleAdd}
            color="gray.800"
            alignSelf="flex-end"
          >
            {t("add_title")}
          </Button>
        </div>
        <div className="md:mx-2 space-y-2">
          {data.map((coachInfo) => (
            <div
              key={coachInfo.id}
              className="flex justify-between items-center p-3 border border-gray-700 rounded"
            >
              <div>
                <p className="text-lg font-medium">{t("title")}</p>
                <p>
                  {t("zh")}: {coachInfo.zhTitle}
                </p>
                <p>
                  {t("en")}: {coachInfo.enTitle ?? t("not_set")}
                </p>
              </div>

              <SmallCloseIcon
                onClick={() => handleTitleRemove(coachInfo.id)}
                textColor="gray.800"
                bg="white"
                rounded="full"
                cursor="pointer"
              />
            </div>
          ))}
        </div>

        {(addCoachInfoIsLoading || removeCoachInfoIsLoading) && (
          <div className="flex justify-end px-4">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};
