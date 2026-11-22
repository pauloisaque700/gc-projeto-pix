"use client"
import Link from 'next/link'
import Tela from '../../../components/Tela'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)

    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const handleEntrar = async () => {
        setErro(null)

        if (!email || !senha) {
            setErro('Preencha e-mail e senha para continuar.')
            return
        }

        setLoading(true)
        try {
            // TODO: chamar aqui a função de login da sua API
            // const usuario = await fazerLogin({ email, senha })
            // salvarUsuarioLogado(usuario.id)
            router.push('/tela-principal')
        } catch (erroCapturado) {
            if (erroCapturado instanceof Error) {
                setErro(erroCapturado.message)
            } else {
                setErro('Não foi possível entrar. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tela>
            <div className="flex flex-col flex-1 min-h-screen w-full px-6 py-10">
                {/* Topo: logo e títulos */}
                <div className="flex flex-col items-center gap-3">
                    <img src="/bye.png" className="w-60 h-10 object-contain" />
                    <p className="text-sm text-gray-500">Dê adeus ao seu dinheiro</p>
                </div>

                <div className="flex flex-col items-center text-center mt-10 mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Bem-vindo de volta</h1>
                    <p className="text-sm text-gray-500 mt-3">
                        Acesse sua conta para gerenciar seus projetos.
                    </p>

                    {/* Imagem de usuário */}
                    <div className="w-28 h-28 mt-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-sm">
                        <User className="w-20 h-20 stroke-[1.8] text-gray-500" />
                    </div>
                </div>

                {/* Campos, com bastante espaço entre si */}
                <div className="flex flex-col gap-8">
                    <Input
                        label="Endereço de e-mail"
                        placeholder="nome@exemplo.com"
                        icon={<Mail className="w-5 h-5 stroke-[1.8]" />}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="relative">
                        <Link
                            href="/login/esqueci-senha"
                            className="absolute top-0 right-0 text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
                        >
                            Esqueceu a senha?
                        </Link>
                        <Input
                            label="Senha"
                            placeholder="••••••••"
                            icon={<Lock className="w-5 h-5" />}
                            type={mostrarSenha ? 'text' : 'password'}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            className="absolute bottom-0 right-4 h-12 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            {mostrarSenha ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                    </div>

                    {erro && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
                        </div>
                    )}
                </div>

                {/* Rodapé: pb-20 sobe o botão e o "Criar conta" */}
                <div className="mt-auto pt-10 pb-20 flex flex-col gap-6">
                    <BotaoGrande
                        text="Entrar"
                        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                        textClass="text-white font-semibold"
                        widthClass="w-full"
                        isLoading={loading}
                        disabled={loading}
                        onClick={handleEntrar}
                    />

                    <p className="text-center text-sm text-gray-500">
                        Não tem uma conta?{' '}
                        <Link href="/login/cadastrar-usuario" className="font-semibold text-[#4F46E5] hover:text-[#4338CA]">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </Tela>
    )
}