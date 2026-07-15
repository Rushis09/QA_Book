import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { jwtDecode } from "jwt-decode";

import {
  resetToDemo,
  setEnvironment,
} from "../config/environment";

interface JwtPayload {
  sub: string;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(
  null,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    null,
  );

  const [username, setUsername] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(
      "access_token",
    );

    if (storedToken) {
      try {
        const decoded =
          jwtDecode<JwtPayload>(storedToken);

        setToken(storedToken);
        setUsername(decoded.sub);
      } catch {
        localStorage.removeItem(
          "access_token",
        );
      }
    }
  }, []);

  function login(token: string) {
    const decoded =
      jwtDecode<JwtPayload>(token);

    localStorage.setItem(
      "access_token",
      token,
    );

    setEnvironment("production");

    setToken(token);
    setUsername(decoded.sub);
  }

  function logout() {
    localStorage.removeItem(
      "access_token",
    );
  
    resetToDemo();
  
    setToken(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}