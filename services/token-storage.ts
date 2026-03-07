export const ACCESS_TOKEN_COOKIE = "access_token";
export const USER_ROLE_COOKIE = "user_role";

const ACCESS_TOKEN_KEY = ACCESS_TOKEN_COOKIE;
const USER_ROLE_KEY = USER_ROLE_COOKIE;
const COOKIE_MAX_AGE_DAYS = 7;

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[^.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export class TokenStorage {
  private static instance: TokenStorage;

  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  public static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public static setAccessToken(access_token: string): void | null {
    if (typeof window === "undefined") return null;
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    setCookie(ACCESS_TOKEN_KEY, access_token);
  }

  public static removeAccessToken(): void | null {
    if (typeof window === "undefined") return null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    removeCookie(ACCESS_TOKEN_KEY);
  }

  public static getRole(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(USER_ROLE_KEY) ?? localStorage.getItem(USER_ROLE_KEY);
  }

  public static setRole(role: string): void | null {
    if (typeof window === "undefined") return null;
    localStorage.setItem(USER_ROLE_KEY, role);
    setCookie(USER_ROLE_KEY, role);
  }

  public static removeRole(): void | null {
    if (typeof window === "undefined") return null;
    localStorage.removeItem(USER_ROLE_KEY);
    removeCookie(USER_ROLE_KEY);
  }

  public static clear(): void {
    TokenStorage.removeAccessToken();
    TokenStorage.removeRole();
  }
}
