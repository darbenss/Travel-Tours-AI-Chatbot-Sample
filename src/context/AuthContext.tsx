"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type User = {
    email: string;
    id: string;
    is_admin: boolean;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    signup: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    signup: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem("token");
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            // Decode user from token or fetch /me if available?
            // Since our token is JWT but we don't have a /me endpoint explicitly for USER details (only bookings/me).
            // WAIT! I don't have a /api/users/me endpoint to get user details!
            // The implementation plan didn't include it. 
            // The plan said: `server/api/bookings.py`: `GET /bookings/me`: Get bookings.
            // But how do I know if I'm admin? I need user details.
            // I can extract from JWT (it has sub=id) but not is_admin status unless encoded.
            // Or I can add a `/me` endpoint. 
            // User requested "Check their own bookings" -> dashboard has bookings.
            // For Navbar ("Log In" vs "Logout"), just having a token is usually enough?
            // But Admin vs User needs distinction.
            // Let's assume for now I'll just check if token exists. 
            // BETTER: I'll quickly check if I can decode JWT in frontend or if I should add /me.
            // Adding /me is cleaner.
            // Wait, let's look at `server/api/auth.py`. Login returns `UserResponse`? No, `Token`.
            // Signup returns `UserResponse`.
            // Login returns only access_token.
            // I should modify login to return user info OR add /me endpoint.
            // Given constraints, I'll add /me endpoint to `server/api/auth.py` quickly or decode token if I put claims there. 
            // I didn't put claims in token (only sub).
            // I will add a simple Fetch to get user details. I'll add `GET /auth/me` to `server/api/auth.py`. 

            // FOR NOW: I will fail gracefully. If I can't get user details, I might creating a temporary User object from token? No.
            // I'll add the endpoint. It's robust.
            // BUT I cannot modify backend now without explicit instruction or implicit permission "frontend integration" implies backend support.
            // I will implement fetching logic, and if it fails, I'll fix backend.

            // Let's try to fetch from a hypothetic /auth/me or just trust the token for now and fail later?
            // No, let's make it work. I'll add `GET /auth/me` to backend.

            // Actually, let's look at `server/api/deps.py`. `get_current_user` returns `User`. 
            // So I can just make an endpoint `GET /users/me`.

            const userData = await apiRequest("/auth/me"); // I will add this.
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string) => {
        localStorage.setItem("token", token);
        fetchUser(token);
        router.push("/dashboard");
    };

    const signup = (token: string) => {
        localStorage.setItem("token", token);
        fetchUser(token);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
