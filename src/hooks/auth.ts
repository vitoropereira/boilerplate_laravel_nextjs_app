import useSWR from 'swr';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../server/axios';
import Cookies from 'js-cookie';
import { AuthUserContext } from '../utils/authContext';
import { Console } from 'console';

interface AuthProp {
    middleware?: string;
    redirectIfAuthenticated?: string;
}

interface RegisterProps {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    setErrors(errors: any): void;
    setIsLoading(isLoading: boolean): void;
}

export interface UserProps {
    id: number;
    access_level: number;
    address1?: string;
    address2?: string;
    cell_phone?: string;
    city?: string;
    country?: string;
    cpf?: string;
    email: string;
    image_path?: string;
    name: string;
    neighborhood?: string;
    postcode?: string;
    state?: string;
}

interface AuthProps {
    user: UserProps;
    token: string;
}

export const useAuth = ({ middleware, redirectIfAuthenticated }: AuthProp) => {
    const [token, setToken] = useState<string>('');
    const { user, setUser } = useContext(AuthUserContext);

    const router = useRouter();

    const { data, error } = useSWR<AuthProps>('/api/user', () =>
        axios
            .get('/api/user')
            .then((response) => {
                setToken(response.data.token);
                setUser(response.data.user);
                return response.data;
            })
            .catch((error) => {
                if (error.response.status !== 409) throw error;
                router.push('/verify-email');
            })
    );

    axios.defaults.headers.common['Authorization'] = `Bearer ${Cookies.get('token')}`;

    const registerUser = async ({ setErrors, setIsLoading, ...props }: RegisterProps) => {
        setErrors([]);
        setIsLoading(true);

        const response = axios
            .post('/api/register', props)
            .then((response) => {
                setToken(response.data.token);
                setUser(response.data.user);
                return response.status;
            })
            .catch((error) => {
                if (error.response.status !== 422) throw error;
                setIsLoading(false);
                setErrors(Object.values(error.response.data.errors).flat());
            });

        return response;
    };

    const login = async ({ setErrors, setStatus, setIsLoading, ...props }) => {
        setErrors([]);
        setStatus(null);
        axios
            .post('/api/login', props)
            .then((res) => {
                Cookies.set('token', res.data.token);
                setToken(res.data.token);
                setUser(res.data.user);
                return;
            })
            .catch((error) => {
                if (error.response?.status !== 422) throw error;
                setErrors(Object.values(error.response.data.errors).flat());
            });
    };

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        setErrors([]);
        setStatus(null);

        axios
            .post('/forgot-password', { email })
            .then((response) => setStatus(response.data.status))
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(Object.values(error.response.data.errors).flat());
            });
    };

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        setErrors([]);
        setStatus(null);

        axios
            .post('/reset-password', { token: router.query.token, ...props })
            .then((response) => router.push('../../?reset=' + btoa(response.data.status)))
            .catch((error) => {
                if (error.response.status != 422) throw error;

                setErrors(Object.values(error.response.data.errors).flat());
            });
    };

    const resendEmailVerification = ({ setStatus }) => {
        axios.post('/email/verification-notification').then((response) => setStatus(response.data.status));
    };

    const logout = async () => {
        if (!error) {
            await axios.post('/api/logout/' + user.id);
        }

        window.location.pathname = '/';
    };

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user) router.push(redirectIfAuthenticated);
        if (middleware === 'auth' && error) logout();
    }, [user, error]);

    return {
        user,
        token,
        data,
        registerUser,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    };
};
