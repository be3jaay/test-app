export const ACCESS_TOKEN_COOKIE = "access_token";
export const USER_ROLE_COOKIE = "user_role";
export const HAS_COMPLETED_COOKIE = "has_completed";

const USER_ID_COOKIE = "user_id";

const ACCESS_TOKEN_KEY = ACCESS_TOKEN_COOKIE;
const USER_ROLE_KEY = USER_ROLE_COOKIE;
const HAS_COMPLETED_KEY = HAS_COMPLETED_COOKIE;
const USER_ID_KEY = USER_ID_COOKIE;
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

  public static getHasCompleted(): boolean {
    if (typeof window === "undefined") return true;
    const v = getCookie(HAS_COMPLETED_KEY) ?? localStorage.getItem(HAS_COMPLETED_KEY);
    return v === "true";
  }

  public static setHasCompleted(completed: boolean): void | null {
    if (typeof window === "undefined") return null;
    const v = completed ? "true" : "false";
    localStorage.setItem(HAS_COMPLETED_KEY, v);
    setCookie(HAS_COMPLETED_KEY, v);
  }

  public static removeHasCompleted(): void | null {
    if (typeof window === "undefined") return null;
    localStorage.removeItem(HAS_COMPLETED_KEY);
    removeCookie(HAS_COMPLETED_KEY);
  }

  public static getUserId(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(USER_ID_KEY) ?? localStorage.getItem(USER_ID_KEY);
  }

  public static setUserId(id: string): void | null {
    if (typeof window === "undefined") return null;
    localStorage.setItem(USER_ID_KEY, id);
    setCookie(USER_ID_KEY, id);
  }

  public static removeUserId(): void | null {
    if (typeof window === "undefined") return null;
    localStorage.removeItem(USER_ID_KEY);
    removeCookie(USER_ID_KEY);
  }

  public static clear(): void {
    TokenStorage.removeAccessToken();
    TokenStorage.removeRole();
    TokenStorage.removeHasCompleted();
    TokenStorage.removeUserId();
  }
}
