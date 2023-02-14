export const getTimeDisplay = (hours = 0, minutes = 0) => {
  const hourDisplay = hours / 10 > 1 ? hours : hours === 0 ? "00" : `0${hours}`;
  const minuteDisplay =
    minutes / 10 > 1 ? minutes : minutes === 0 ? "00" : `0${minutes}`;
  return `${hourDisplay}:${minuteDisplay}`;
};
