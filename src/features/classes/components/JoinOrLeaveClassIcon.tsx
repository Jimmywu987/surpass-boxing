import { cn } from "@/utils/cn";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";

export const JoinOrLeaveClassIcon = ({
  isJoined,
  shouldDisabled,
  onClickLeaveClass,
  onClickJoinClass,
}: {
  isJoined: boolean;
  shouldDisabled: boolean;
  onClickLeaveClass: () => Promise<void>;
  onClickJoinClass: () => Promise<void>;
}) => {
  if (isJoined) {
    return (
      <MinusIcon
        bg={!shouldDisabled ? "red.600" : "gray.500"}
        rounded="full"
        p="1.5"
        className={cn("text-2xl", !shouldDisabled && "cursor-pointer")}
        onClick={onClickLeaveClass}
      />
    );
  }

  return (
    <AddIcon
      bg={!shouldDisabled ? "green.600" : "gray.500"}
      rounded="full"
      p="1.5"
      className={cn("text-2xl", !shouldDisabled && "cursor-pointer")}
      onClick={onClickJoinClass}
    />
  );
};
