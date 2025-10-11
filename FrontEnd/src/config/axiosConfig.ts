import axios, { AxiosResponse } from "axios";
import { ReturnResult } from "../types/common/return-result";
import { toast } from "sonner";

const defaultOptions = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const instance = axios.create(defaultOptions);

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("accessToken");
    config.headers.Authorization = token ? `Bearer ${token} ` : "";
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor, if the return result has message => that means we have error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
instance.interceptors.response.use(
  function onFulfilled(response: AxiosResponse<ReturnResult<any>>) {
    if (response.data.message) {
      toast.error(response.data.message);
    }
    return response;
  },
  function onRejected(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
