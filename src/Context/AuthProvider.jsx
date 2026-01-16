import { createContext, useContext, useEffect, useMemo } from "react";
import { AUTH_KEYS, useAuthCheck } from "../hooks/QueryLayer/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { authManager } from "../components/Token/authManager";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const queryClient = useQueryClient();
    const { data: user, isLoading, isError } = useAuthCheck();

    useEffect(() => {
        const unsubscribe = authManager.onChange((newToken) => {

            if (newToken) {
                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() });
            } else {
                queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
            }
        })
        //clearup을 구독 해제로 제공함
        return unsubscribe;
    }, [queryClient,])

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