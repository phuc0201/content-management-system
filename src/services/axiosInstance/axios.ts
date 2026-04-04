// import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
// import { SYSTEM_CONSTANT } from "../../constants/system.constant";
// import { PATH } from "../../constants/path.constant";

// const baseURL = import.meta.env.VITE_ENDPOINT || "http://localhost:3000/api";

// type RefreshResponse = {
//   accessToken: string;
//   refreshToken: string;
// };

// type RetryRequestConfig = InternalAxiosRequestConfig & {
//   _retry?: boolean;
// };

// const instance = axios.create({
//   baseURL,
//   timeout: 15000,
// });

// let refreshPromise: Promise<string> | null = null;

// function clearAuthAndRedirect() {
//   localStorage.removeItem(SYSTEM_CONSTANT.ACCESS_TOKEN);
//   localStorage.removeItem(SYSTEM_CONSTANT.REFRESH_TOKEN);
//   window.location.href = PATH.SIGNIN;
// }

// async function refreshAccessToken(): Promise<string> {
//   const refreshToken = localStorage.getItem(SYSTEM_CONSTANT.REFRESH_TOKEN);
//   if (!refreshToken) {
//     throw new Error("Missing refresh token");
//   }

//   const response = await axios.post<RefreshResponse>(`${baseURL}/auth/refresh-token`, {
//     refreshToken,
//   });

//   const { accessToken, refreshToken: newRefreshToken } = response.data;

//   localStorage.setItem(SYSTEM_CONSTANT.ACCESS_TOKEN, accessToken);
//   localStorage.setItem(SYSTEM_CONSTANT.REFRESH_TOKEN, newRefreshToken);

//   return accessToken;
// }

// instance.interceptors.request.use(
//   (cfg) => {
//     const token = localStorage.getItem(SYSTEM_CONSTANT.ACCESS_TOKEN);
//     if (token) {
//       cfg.headers.Authorization = `Bearer ${token}`;
//     }
//     return cfg;
//   },
//   (e) => Promise.reject(e),
// );

// instance.interceptors.response.use(
//   (r) => r,
//   async (rawError: AxiosError) => {
//     const status = rawError.response?.status;
//     const originalRequest = rawError.config as RetryRequestConfig | undefined;

//     if (status !== 401 || !originalRequest) {
//       return Promise.reject(rawError);
//     }

//     const requestUrl = originalRequest.url ?? "";
//     const isRefreshRequest = requestUrl.includes("refresh-token");

//     if (originalRequest._retry || isRefreshRequest) {
//       clearAuthAndRedirect();
//       return Promise.reject(rawError);
//     }

//     originalRequest._retry = true;

//     try {
//       if (!refreshPromise) {
//         refreshPromise = refreshAccessToken().finally(() => {
//           refreshPromise = null;
//         });
//       }

//       const newAccessToken = await refreshPromise;
//       originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//       return instance(originalRequest);
//     } catch (refreshError) {
//       clearAuthAndRedirect();
//       return Promise.reject(refreshError);
//     }
//   },
// );

// export default instance;

// khi nào cần AC và RF thì bật ở trên ra

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { PATH } from "../../constants/path.constant";
import { clearAuth, getAccessToken } from "../../utils/authHelpers";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const instance = axios.create({
  baseURL,
  timeout: 15000,
});

function clearAuthAndRedirect() {
  clearAuth();
  window.location.href = PATH.SIGNIN;
}

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
    const status = rawError.response?.status;
    const originalRequest = rawError.config as RetryRequestConfig | undefined;
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (status === 401 && originalRequest && !isLoginRequest) {
      clearAuthAndRedirect();
    }

    return Promise.reject(rawError);
  },
);

export default instance;
