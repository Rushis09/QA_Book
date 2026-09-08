import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

interface Account {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  account: Account | null;
  username: string | null;
  role: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(null);

  const [account, setAccount] =
    useState<Account | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadAccount() {
    try {
      const response =
        await api.get<Account>("/auth/me");

      setAccount(response.data);
      setToken(
        localStorage.getItem(
          "access_token",
        ),
      );
    } catch {
      localStorage.removeItem(
        "access_token",
      );

      setToken(null);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedToken =
      localStorage.getItem(
        "access_token",
      );

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    loadAccount();
  }, []);

  async function login(
    accessToken: string,
  ) {
    localStorage.setItem(
      "access_token",
      accessToken,
    );

    setToken(accessToken);

    try {
      const response =
        await api.get<Account>(
          "/auth/me",
        );

      setAccount(response.data);
    } catch {
      localStorage.removeItem(
        "access_token",
      );

      setToken(null);
      setAccount(null);

      throw new Error(
        "Failed to load account information.",
      );
    }
  }

  function logout() {
    localStorage.removeItem(
      "access_token",
    );

    setToken(null);
    setAccount(null);

    window.location.reload();
  }

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated:
          !!token && !!account,
        token,
        account,
        username:
          account?.username ?? null,
        role:
          account?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}