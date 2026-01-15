import { createContext, useContext, useMemo } from "react";
import { useAuthCheck } from "../hooks/QueryLayer/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { data: user, isLoading, isError } = useAuthCheck();


    const authState = useMemo(() => ({
        user,
        isLoggedIn: !!user,
        isLoading,
        isError
    }), [user, isLoading, isError]);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("AuthContext 범위 밖의 context 접근입니다.");
    }
    return context;
}