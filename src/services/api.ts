import { getToken } from "@/utils/auth";
import axios from "axios";

const api = {
    baseUrl: 'https://alitinvoiceappapi.azurewebsites.net/api',
}

const axiosInstance = axios.create({
    baseURL: api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;

