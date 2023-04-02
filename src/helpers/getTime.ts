import { intervalToDuration } from "date-fns";

export const getTimeDisplay = (hours = 0, minutes = 0) => {
  const hourDisplay = hours / 10 > 1 ? hours : hours === 0 ? "00" : `0${hours}`;
  const minuteDisplay =
    minutes / 10 > 1 ? minutes : minutes === 0 ? "00" : `0${minutes}`;
  return `${hourDisplay}:${minuteDisplay}`;
};

export const getTimeDuration = ({
  startTime,
  endTime,
}: {
  startTime: number;
  endTime: number;
}) => {
  const startIntervalTime = intervalToDuration({
    start: 0,
    end: startTime,
  });
  const endIntervalTime = intervalToDuration({
    start: 0,
    end: endTime,
  });
  const start = getTimeDisplay(
    startIntervalTime.hours ?? 0,
    startIntervalTime.minutes ?? 0
  );
  const end = getTimeDisplay(
    endIntervalTime.hours ?? 0,
    endIntervalTime.minutes ?? 0
  );

  return `${start} - ${end}`;
};
