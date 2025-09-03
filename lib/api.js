import axios from "axios";

export const API_URL = "https://207.154.255.87/api";

export async function login(username, password) {
    const { data } = await axios.post(`${API_URL}/login/`, {
        username,
        password,
    });
    return data;
}

export async function logout(access_token, refresh_token) {
    const { data } = await axios.post(
        `${API_URL}/logout/`,
        { refresh: refresh_token },
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        }
    );
    return data;
}


export async function fetchFaceDetection() {
    const { data } = await axios.get(`${API_URL}/face-detection/`);
    return Array.isArray(data) ? data[data.length - 1] : data;
}

export async function sendStudentActivity(payload) {
    const { data } = await axios.post(`${API_URL}/student-activity/`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
}

export async function checkAuth(access_token) {
    const { data } = await axios.get(`${API_URL}/me/`, {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    return data;
}
