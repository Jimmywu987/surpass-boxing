export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported in this browser.");
  }
  return await navigator.serviceWorker.register("/serviceWorker.js");
};

export const getReadyServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported in this browser.");
  }
  return await navigator.serviceWorker.ready;
};
