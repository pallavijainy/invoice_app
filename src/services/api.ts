import { getToken } from "@/utils/auth";
import axios from "axios";

const api = {
    baseUrl: 'https://alitinvoiceappapi.azurewebsites.net/api',
}

const axiosInstance = axios.create({
    baseURL: api.baseUrl,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;

