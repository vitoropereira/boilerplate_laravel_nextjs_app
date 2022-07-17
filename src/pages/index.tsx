import { useAuth } from '../hooks/auth';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
    const route = useRouter();

    useEffect(() => {
        route.push('./admin/login');
    }, []);

    return (
        <>
            <Head>
                <title>Meu Boilerplate</title>
            </Head>
        </>
    );
}
