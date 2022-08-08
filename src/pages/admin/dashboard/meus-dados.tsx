import Head from 'next/head';
import Image from 'next/image';
import { useContext, useEffect, useMemo, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { SubmitHandler, useForm } from 'react-hook-form';

import axios from '../../../server/axios';
import { UserProps } from '../../../hooks/auth';
import AuthValidationErrors from '../../../components/AuthValidationErrors';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import AppLayout from '../../../components/Layouts/AppLayout';
import AuthValidationSuccess from '../../../components/AuthValidationSuccess';
import { AuthUserContext } from '../../../utils/authContext';

import profile from '../../../../public/images/profile_img.png';
import { notifyError, notifySuccess } from '../../../hooks/toast';

const MyData = () => {
    const { user } = useContext(AuthUserContext);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: useMemo(() => {
            return user;
        }, [user]),
    });

    useEffect(() => {
        reset(user);
    }, [user]);

    const [image_path, setImage_path] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiErros, setApiErros] = useState([]);

    const saveMyData = async ({ setApiErros, data, user_id }) => {
        const response = axios
            .put(`/api/user/${user_id}`, data)
            .then((response) => {
                return response.status;
            })
            .catch((error) => {
                if (error.response.status !== 422) throw error;
                setApiErros([error.response.data.message]);
            });

        return response;
    };

    const onSubmit: SubmitHandler<UserProps> = async (data) => {
        setIsLoading(true);

        if (data.cpf == '') {
            setIsLoading(false);
            setApiErros(['Preencha o campo CPF']);
            setApiErros([]);
            return;
        }

        const cfpError = handleCheckCPF(data.cpf);

        if (cfpError !== '') {
            setIsLoading(false);
            setApiErros([cfpError]);
            return;
        }

        Object.keys(data).map((key) => (data[key] === null || data[key] === '' ? delete data[key] : ''));

        try {
            const user_id = user.id;

            const userResponse = await saveMyData({
                setApiErros,
                data,
                user_id,
            });

            if (userResponse === 200) {
                setIsLoading(false);
                notifySuccess('Dados atualizados com sucesso!', 4000);
            } else {
                setIsLoading(false);
                notifyError('Erro ao atualizar os dados!', 4000);
            }
        } catch (err) {
            setApiErros(['Erro ao salvar os dados, tente novamente mais tarde.']);
            setIsLoading(false);
        }
    };

    function handleCheckCPF(cpf: string) {
        let strCPF = cpf;
        strCPF = String(strCPF.replace(/[^\d]+/g, ''));

        if (strCPF.length > 11) {
            setApiErros(['CPF Invalido']);
            return;
        }

        var Soma: number;
        var Resto: number;
        Soma = 0;

        if (strCPF === '00000000000') {
            setApiErros(['CPF Invalido']);
            return;
        }

        for (var i = 1; i <= 9; i++) {
            Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
            Resto = (Soma * 10) % 11;
        }
        if (Resto == 10 || Resto == 11) Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10))) return 'CPF Invalido';

        Soma = 0;
        for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;

        if (Resto == 10 || Resto == 11) Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11))) return 'CPF Invalido';

        return '';
    }

    function thereIsAnError() {
        if (apiErros.length > 0) {
            apiErros.forEach((error) => notifyError(error, 4000));
            setIsLoading(false);
            setApiErros([]);
        }
    }

    useEffect(() => {
        thereIsAnError();
    }, [apiErros]);

    return (
        <AppLayout
            header={
                <>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {!user ? 'Carregando...' : 'Meus dados'}
                    </h2>
                </>
            }>
            <Head>
                <title>Meu Boilerplate</title>
            </Head>
            {isLoading || !user ? (
                <div className="flex justify-center items-center h-96 w-full">
                    <div className="w-16 h-16 border-4 border-blue-400 border-solid border-y-white rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-full mx-2 sm:px-4 lg:px-6">
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 bg-white border-b border-gray-200">
                                        <div className="card card-small mb-4 pt-3">
                                            <div className="card-header border-bottom text-center">
                                                <div className="mb-3 mx-auto h-16 w-16">
                                                    <Image
                                                        className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                                                        src={profile}
                                                        alt="User Avatar"
                                                    />
                                                </div>
                                                <h4 id="name" className="mb-0">
                                                    {user.name}
                                                </h4>
                                                <span className="border-bottom"></span>
                                                <button
                                                    type="submit"
                                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                                        <FaCamera
                                                            className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    {image_path == '' ? 'Enviar Imagem' : 'Trocar Imagem'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 w-full mx-2 sm:px-4 lg:px-6">
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 bg-white border-b border-gray-200">
                                        <AuthValidationErrors className="mb-4" errors={apiErros} />

                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                                                Informação do Usuário
                                            </h6>
                                            <div className="flex flex-wrap">
                                                <div className="w-full lg:w-6/12 px-4">
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password">
                                                            Nome Completo
                                                        </label>
                                                        <Input
                                                            name="name"
                                                            type="text"
                                                            className="focus:ring-indigo-500 focus:border-indigo-500  block mt-1 w-full"
                                                            autoFocus
                                                            register={register}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-full lg:w-6/12 px-4">
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password">
                                                            E-mail
                                                        </label>
                                                        <Input
                                                            name="email"
                                                            type="email"
                                                            placeholder="Digite um e-mail"
                                                            className="focus:ring-indigo-500 focus:border-indigo-500   block mt-1 w-full"
                                                            disabled
                                                            register={register}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-full lg:w-6/12 px-4">
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password">
                                                            CPF
                                                        </label>
                                                        <Input
                                                            id="cpf"
                                                            type="text"
                                                            className="focus:ring-indigo-500 focus:border-indigo-500  block mt-1 w-full"
                                                            max="14"
                                                            name="cpf"
                                                            mask="cpf"
                                                            register={register}
                                                            maxLength={11}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-full lg:w-6/12 px-4">
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password">
                                                            Telefone
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            className="focus:ring-indigo-500 focus:border-indigo-500  block mt-1 w-full"
                                                            name="cell_phone"
                                                            mask="phone"
                                                            placeholder="Digite o n° do telefone."
                                                            register={register}
                                                        />
                                                    </div>
                                                </div>

                                                <hr className="mt-6 border-b-1 border-blueGray-300" />

                                                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                                                    Informação de Endereço
                                                </h6>
                                                <div className="flex flex-wrap">
                                                    <div className="w-full lg:w-12/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                Endereço
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500  block mt-1 w-full"
                                                                name="address1"
                                                                placeholder="Digite seu Endereço"
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                Complemento
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500  block mt-1 w-full"
                                                                name="address2"
                                                                placeholder="Digite um complemento, caso tenha."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                Bairro
                                                            </label>

                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block mt-1 w-full"
                                                                name="neighborhood"
                                                                placeholder="Digite seu bairro."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                Cidade
                                                            </label>

                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block mt-1 w-full"
                                                                name="city"
                                                                placeholder="Digite o nome da cidade."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                Estado
                                                            </label>

                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block mt-1 w-full"
                                                                name="state"
                                                                placeholder="Digite o nome do estado."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                País
                                                            </label>

                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block mt-1 w-full"
                                                                name="country"
                                                                placeholder="Digite o nome do país."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-4/12 px-4">
                                                        <div className="relative w-full mb-3">
                                                            <label
                                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                                htmlFor="grid-password">
                                                                CEP
                                                            </label>

                                                            <Input
                                                                type="text"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block mt-1 w-full"
                                                                max="10"
                                                                mask="cep"
                                                                name="postcode"
                                                                placeholder="Digite seu CEP."
                                                                register={register}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end mt-4">
                                                <Button className="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    Salvar
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default MyData;
