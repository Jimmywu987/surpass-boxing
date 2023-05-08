import { trpc } from "@/utils/trpc";
import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  Select,
  Skeleton,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { ClassLevelEnum } from "@prisma/client";

import useTranslation from "next-translate/useTranslation";
import { useRef, useState } from "react";

export const AdminClassTypesSection = () => {
  const { classRouter } = trpc;
  const [level, setLevel] = useState<ClassLevelEnum>(ClassLevelEnum.BEGINNER);
  const { data, isLoading } = trpc.classRouter.fetch.useQuery();
  const utils = trpc.useContext();
  const classTypeRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation("admin");
  const {
    mutateAsync: createClassTypeMutateAsync,
    isLoading: createClassTypeIsLoading,
  } = classRouter.create.useMutation({
    onSuccess: async () => {
      utils.classRouter.fetch.invalidate();
    },
  });
  const {
    mutateAsync: removeClassTypeMutateAsync,
    isLoading: removeClassTypeIsLoading,
  } = classRouter.remove.useMutation({
    onSuccess: async () => {
      utils.classRouter.fetch.invalidate();
    },
  });

  const handleClassTypeAdd = async () => {
    if (classTypeRef && classTypeRef.current && classTypeRef.current.value) {
      const name = classTypeRef.current.value;
      await createClassTypeMutateAsync({ name, level });
      classTypeRef.current.value = "";
    }
  };
  const handleClassTypeRemove = async (id: string) => {
    if (!createClassTypeIsLoading || !removeClassTypeIsLoading) {
      await removeClassTypeMutateAsync({ id });
    }
  };
  if (!data || isLoading) {
    return (
      <Stack w="280px">
        <Skeleton height="40px" />
        <div className="space-y-1">
          <Skeleton height="35px" />
          <Skeleton height="35px" />
        </div>
      </Stack>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1">
        <div className="flex bg-white rounded ">
          <Input
            type="text"
            placeholder={t("class_type")}
            bg="white"
            textColor="gray.800"
            ref={classTypeRef}
          />
          <Select
            onChange={(event) => {
              const value = event.target.value as ClassLevelEnum;
              setLevel(value);
            }}
            value={level}
            color="gray.800"
            className="border border-gray-400 text-gray-700"
          >
            {Object.values(ClassLevelEnum).map((level, index) => (
              <option key={index} value={level}>
                {t(`classes:${level.toLowerCase()}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button
          size="sm"
          onClick={handleClassTypeAdd}
          color="gray.800"
          alignSelf="flex-end"
          disabled={createClassTypeIsLoading || removeClassTypeIsLoading}
        >
          {t("add_class_type")}
        </Button>
      </div>
      <div className="mx-2">
        {data.map((type) => (
          <div
            key={type.id}
            className="flex justify-between items-center p-3 border border-gray-700 rounded"
          >
            <span>
              {type.name} ({t(`classes:${type.level?.toLowerCase()}`)})
            </span>

            <SmallCloseIcon
              onClick={() => handleClassTypeRemove(type.id)}
              textColor="gray.800"
              bg="white"
              rounded="full"
              cursor="pointer"
            />
          </div>
        ))}
      </div>

      {(createClassTypeIsLoading || removeClassTypeIsLoading) && (
        <div className="flex justify-end px-4">
          <Spinner />
        </div>
      )}
    </div>
  );
};
