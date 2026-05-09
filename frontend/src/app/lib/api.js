    import axios from "axios";

    const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    });

    export async function registerUser(registerData) {
    try {
        const response = await api.post("/auth/register", registerData);
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Registration failed"
        );
    }
    }

    export async function loginUser(loginData) {
    try {
        const response = await api.post("/auth/login", loginData);
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Login failed"
        );
    }
    }

    export async function getCurrentUser() {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Failed to load profile"
        );
    }
    }

    export async function logoutUser() {
    try {
        const response = await api.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw new Error(
        error.response?.data?.message || "Logout failed"
        );
    }
    }
