import Axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

axios.defaults.withCredentials = true;

const onRequest = (config: AxiosRequestConfig) => {
    if (
        config.method == 'post' ||
        config.method == 'put' ||
        (config.method == 'delete' && !Cookies.get('XSRF-TOKEN'))
    ) {
        return setCSRFToken().then((response) => config);
    }
    return config;
};

const setCSRFToken = () => {
    return axios.get('/sanctum/csrf-cookie');
};

axios.interceptors.request.use(onRequest, null);

export default axios;
