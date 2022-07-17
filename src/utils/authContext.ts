import { createContext } from 'react';
import { UserProps } from '../hooks/auth';

interface AuthContextProps {
    user: UserProps | null;

    setUser(user: UserProps | null): void;
}

export const AuthUserContext = createContext({} as AuthContextProps);
