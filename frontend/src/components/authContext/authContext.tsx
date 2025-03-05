"use client";
import {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface User {
  isAuthenticated: boolean;
  token: string | null;
  data: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | ((prevUser: User | null) => User | null)) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const INITIAL_USER: User = {
  isAuthenticated: false,
  token: null,
  data: {},
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : INITIAL_USER;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return INITIAL_USER;
    }
  });

  const logout = useCallback(() => {
    setUser(INITIAL_USER);
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("Error storing user data:", error);
      }
    }
  }, [user]);

  if (process.env.NODE_ENV === "development") {
    useEffect(() => {
      console.log("AuthProvider mounted");
    }, []);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
