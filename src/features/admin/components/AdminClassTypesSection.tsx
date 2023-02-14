import {
  useClassTypeQuery,
  useCreateClassTypeMutation,
  useRemoveClassTypeMutation,
} from "@/apis/api";
import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Spinner,
  Stack,
} from "@chakra-ui/react";

import useTranslation from "next-translate/useTranslation";
import { useRef } from "react";
import { useQueryClient } from "react-query";

export const AdminClassTypesSection = () => {
  const { data, isLoading } = useClassTypeQuery();
  const queryClient = useQueryClient();

  const { t } = useTranslation("admin");
  const {
    mutateAsync: createClassTypeMutateAsync,
    isLoading: createClassTypeIsLoading,
  } = useCreateClassTypeMutation();
  const {
    mutateAsync: removeClassTypeMutateAsync,
    isLoading: removeClassTypeIsLoading,
  } = useRemoveClassTypeMutation();

  const classTypeRef = useRef<HTMLInputElement>(null);
  const handleClassTypeAdd = async () => {
    if (classTypeRef && classTypeRef.current && classTypeRef.current.value) {
      const name = classTypeRef.current.value;
      await createClassTypeMutateAsync({ name });
      await queryClient.invalidateQueries("classTypes");
      classTypeRef.current.value = "";
    }
  };
  const handleClassTypeRemove = async (id: string) => {
    if (!createClassTypeIsLoading || !removeClassTypeIsLoading) {
      await removeClassTypeMutateAsync({ id });
      await queryClient.invalidateQueries("classTypes");
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
      <InputGroup size="md" px="3">
        <Input
          pr="4.5rem"
          type="text"
          placeholder={t("class_type")}
          bg="white"
          textColor="gray.800"
          ref={classTypeRef}
        />
        <InputRightElement width="4.5rem" mr="6">
          <Button
            h="1.75rem"
            size="sm"
            onClick={handleClassTypeAdd}
            color="gray.800"
            disabled={createClassTypeIsLoading || removeClassTypeIsLoading}
          >
            {t("add_class_type")}
          </Button>
        </InputRightElement>
      </InputGroup>
      <div className="mx-2">
        {data.classTypes.map((type) => (
          <div
            key={type.id}
            className="flex justify-between items-center p-3 border border-gray-700 rounded"
          >
            <span>{type.name}</span>

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
