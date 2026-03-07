export class TokenStorage {
    private static instance: TokenStorage;
  
    public static getInstance(): TokenStorage {
      if (!TokenStorage.instance) {
        TokenStorage.instance = new TokenStorage();
      }
      return TokenStorage.instance;
    }
  
    public static getAccessToken(): string | null {
      if (typeof window === "undefined") {
        return null;
      }
      return localStorage.getItem("access_token");
    }
  
    public static setAccessToken(access_token: string): void | null {
      if (typeof window === "undefined") {
        return null;
      }
      return localStorage.setItem("access_token", access_token);
    }
  
    public static removeAccessToken(): void | null {
      if (typeof window === "undefined") {
        return null;
      }
      return localStorage.removeItem("access_token");
    }
  }