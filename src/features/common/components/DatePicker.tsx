import {
  SingleDatepicker,
  SingleDatepickerProps,
} from "chakra-dayzed-datepicker";

export const DatePicker = ({
  datePickerProps,
}: {
  datePickerProps: SingleDatepickerProps;
}) => {
  return (
    <SingleDatepicker
      {...datePickerProps}
      name="date-input"
      propsConfigs={{
        dayOfMonthBtnProps: {
          defaultBtnProps: {
            borderColor: "gray.800",
            _hover: {
              background: "blue.400",
            },
          },
          selectedBtnProps: {
            background: "#EE72B6",
          },
          todayBtnProps: {
            background: "teal.600",
          },
        },
        inputProps: {
          color: "white",
          size: "sm",
          cursor: "pointer",
        },
        popoverCompProps: {
          popoverContentProps: {
            background: "gray.700",
            color: "white",
          },
        },
      }}
    />
  );
};
