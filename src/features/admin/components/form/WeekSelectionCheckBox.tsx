import { Checkbox } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

export const WeekSelectionCheckBox = ({
  text,
  name,
}: {
  text: string;
  name: string;
}) => {
  const { register } = useFormContext();
  return (
    <Checkbox {...register(name)} whiteSpace="nowrap" mx="3">
      {text}
    </Checkbox>
  );
};
