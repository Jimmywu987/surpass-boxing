import { Button } from "@chakra-ui/react";

export const OptionButton = (data: {
  buttonText: string;
  currentValue: string;
  optionValue: string;
  onClick: () => void;
}) => {
  const { buttonText, currentValue, optionValue, onClick } = data;
  return (
    <Button
      colorScheme="whiteAlpha"
      variant={currentValue === optionValue ? "solid" : "outline"}
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );
};
