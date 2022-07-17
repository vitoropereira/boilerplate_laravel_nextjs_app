import { useState } from 'react';
import Toast from '../components/toast';
import { UserProps } from '../hooks/auth';
import { AuthUserContext } from '../utils/authContext';
import './styles/tailwind.css';

const App = ({ Component, pageProps }) => {
    const [user, setUser] = useState<UserProps>();

    return (
        <AuthUserContext.Provider value={{ user, setUser }}>
            <Toast />
            <Component {...pageProps} />
        </AuthUserContext.Provider>
    );
};
export default App;
