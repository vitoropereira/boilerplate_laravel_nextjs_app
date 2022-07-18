import ApplicationLogo from '../../../../../components/ApplicationLogo';
import AuthCard from '../../../../../components/AuthCard';
import AuthSessionStatus from '../../../../../components/AuthSessionStatus';
import AuthValidationErrors from '../../../../../components/AuthValidationErrors';
import Button from '../../../../../components/Button';
import GuestLayout from '../../../../../components/Layouts/GuestLayout';
import Input from '../../../../../components/Input';
import Label from '../../../../../components/Label';
import Link from 'next/link';
import { useAuth } from '../../../../../hooks/auth';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface PasswordResetFormDataProps {
    email: string;
    password: string;
    password_confirmation: string;
}

interface PasswordResetProps {
    paramEmail: string;
    token: string;
}

const PasswordReset = ({ paramEmail, token }: PasswordResetProps) => {
    const { resetPassword } = useAuth({ middleware: 'guest' });

    const { register, handleSubmit } = useForm<PasswordResetFormDataProps>({
        defaultValues: {
            email: paramEmail,
            password: '',
            password_confirmation: '',
        },
    });

    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    function thereIsAnError(errors: string[]) {
        if (errors.length > 0) {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        thereIsAnError(errors);
    }, [errors]);

    const onSubmit: SubmitHandler<PasswordResetFormDataProps> = async (
        { email, password, password_confirmation },
        event
    ) => {
        event.preventDefault();
        setIsLoading(true);

        resetPassword({
            email,
            password,
            password_confirmation,
            setErrors,
            setStatus,
        });
    };

    return (
        <GuestLayout>
            <AuthCard
                logo={
                    <Link href="/">
                        <a>{/* <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" /> */}</a>
                    </Link>
                }>
                {/* Session Status */}
                <AuthSessionStatus className="mb-4" status={status} />

                {/* Validation Errors */}
                <AuthValidationErrors className="mb-4" errors={errors} />

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Address */}
                    <div>
                        <Label htmlFor="email">Email</Label>

                        <Input
                            type="email"
                            name="email"
                            className="block mt-1 w-full"
                            register={register}
                            required
                            autoFocus
                            disabled
                        />
                    </div>

                    {/* Password */}
                    <div className="mt-4">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            name="password"
                            type="password"
                            className="block mt-1 w-full"
                            register={register}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mt-4">
                        <Label htmlFor="password_confirmation">Confirmação da Senha</Label>

                        <Input
                            name="password_confirmation"
                            type="password"
                            className="block mt-1 w-full"
                            register={register}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <Button>Reiniciar Senha</Button>
                    </div>
                </form>
                {isLoading && (
                    <div>
                        <div className="w-8 h-8 border-4 border-blue-400 border-solid border-y-white rounded-full animate-spin"></div>
                    </div>
                )}
            </AuthCard>
        </GuestLayout>
    );
};

export async function getServerSideProps(ctx: { query: { token: string; email: string } }) {
    const { token, email } = ctx.query;

    return {
        props: {
            paramEmail: email,
            token,
        },
    };
}

export default PasswordReset;
