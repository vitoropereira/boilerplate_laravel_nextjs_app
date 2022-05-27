import Axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

const onRequest = (config: AxiosRequestConfig) => {
    if (
        config.method == 'post' ||
        config.method == 'put' ||
        (config.method == 'delete' && !Cookies.get('XSRF-TOKEN'))
    ) {
        Cookies.set('XSRF-TOKEN', config.headers['X-XSRF-TOKEN']);
        return setCSRFToken().then((response) => {
            console.log('response');
            console.log(response);
            return config;
        });
    }

    return config;
};

const setCSRFToken = () => {
    return axios.get('/sanctum/csrf-cookie');
};

axios.interceptors.request.use(onRequest, null);

export default axios;
