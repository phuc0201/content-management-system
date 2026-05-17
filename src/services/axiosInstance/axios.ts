import axios, { AxiosError } from "axios";
import { getAccessToken } from "../../utils/authHelpers";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const instance = axios.create({
  baseURL,
  timeout: 1000000,
  withCredentials: true,
});

instance.interceptors.request.use(
  (cfg) => {
    const token = getAccessToken();
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (e) => Promise.reject(e),
);

instance.interceptors.response.use(
  (r) => r,
  async (rawError: AxiosError) => {
    return Promise.reject(rawError);
  },
);

export default instance;
