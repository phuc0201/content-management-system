import Cookies from "js-cookie";
import { SYSTEM_CONSTANT } from "../constants/system.constant";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7, // 7 ngày
  secure: false, // = true chỉ gửi qua HTTPS
  sameSite: "Strict",
};

export function getAccessToken(): string | undefined {
  return Cookies.get(SYSTEM_CONSTANT.ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  Cookies.set(SYSTEM_CONSTANT.ACCESS_TOKEN, token, COOKIE_OPTIONS);
}

export function clearAuth(): void {
  Cookies.remove(SYSTEM_CONSTANT.ACCESS_TOKEN);
}
