// lib/api.js
import axios from "axios"

export const API_URL = "https://207.154.255.87/api"

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // 👈 this ensures cookies/sessions are sent
})

// --- API functions ---
export async function login(username, password) {
    const { data } = await api.post("/login/", { username, password })
    return data
}

export async function logout(access_token, refresh_token) {
    const { data } = await api.post(
        "/logout/",
        { refresh: refresh_token },
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        }
    )
    return data
}

export async function fetchFaceDetection() {
    const { data } = await api.get("/face-detection/")
    return Array.isArray(data) ? data[data.length - 1] : data
}

export async function sendStudentActivity(payload) {
    const { data } = await api.post("/student-activity/", payload, {
        headers: { "Content-Type": "application/json" },
    })
    return data
}

export async function checkAuth(access_token) {
    const { data } = await api.get("/me/", {
        headers: { Authorization: `Bearer ${access_token}` },
    })
    return data
}
