import axios from "axios";

let instance = axios.create({
  baseURL: "/",
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("error", error);
  }
);

export async function req(method: string, url: string, data = null) {
  let accessToken = "";
  method = method.toLocaleLowerCase();

  switch (method) {
    case "get":
      return instance.get(url, {
        headers: { authorization: "Bearer " + accessToken },
        params: data,
      });
    case "post":
      return instance.post(url, data);
    case "put":
      return instance.put(url, data);
    case "delete":
      return instance.delete(url, { params: data });
  }
}
