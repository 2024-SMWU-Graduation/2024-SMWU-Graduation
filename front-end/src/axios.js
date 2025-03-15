import axios from 'axios';
// import {logout} from "./authorize/authActions";

export const api = axios.create({
    baseURL: 'https://easy-terview.site/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

const setAxiosInterceptors = () => {
    api.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem('accessToken');
            console.log(accessToken)
            if (accessToken) {
                config.headers['Authorization'] = accessToken;
                // config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            console.log(error)
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                try {
                    const response = await axios.post('https://easy-terview.site/api/auth/reissue', {}, {
                        headers: {
                            'Authorization': accessToken,
                            'Refreshtoken': refreshToken
                        }
                    });

                    const newAccessToken = response.headers['authorization'];
                    const newRefreshToken = response.headers['refreshtoken'];

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers['Authorization'] = newAccessToken;
                    return api(originalRequest);
                } catch (refreshError) {
                    // logoutCallback();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
}

setAxiosInterceptors();


