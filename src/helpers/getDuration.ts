import { intervalToDuration } from "date-fns";

export const getDuration = (startTime: number, endTime: number) => {
  if (endTime - startTime <= 0) {
    return ["classes:hours", { hours: 0 }];
  }
  const duration = intervalToDuration({ start: startTime, end: endTime });

  const minutePlural = duration.minutes === 1 ? "" : "s";

  const hourPlural = duration.hours === 1 ? "" : "s";

  if (duration.hours === 0) {
    return ["classes:minutes", { ...duration, minutePlural }];
  }
  if (duration.minutes === 0) {
    return ["classes:hours", { ...duration, hourPlural }];
  }

  return [
    "classes:hours_minutes",
    {
      ...duration,
      hourPlural,
      minutePlural,
    },
  ];
};
