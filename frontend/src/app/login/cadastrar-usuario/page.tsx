"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { User, Lock, Mail, Phone, CreditCard, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarUsuario, ApiError } from '../../../lib/api'
import { salvarUsuarioLogado } from '../../../lib/session'

// Função que cria a máscara do CPF e bloqueia letras ou limite estourado
const formatarCPF = (valor: string) => {
    return valor
        .replace(/\D/g, '') // Remove tudo que não for número
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen
        .replace(/(-\d{2})\d+?$/, '$1'); // Trava em 14 caracteres
}

// Função que cria a máscara do Telefone
const formatarTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, ''); // Remove tudo que não é número
    v = v.slice(0, 11); // Limita a 11 dígitos
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses no DDD
    v = v.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen antes dos 4 últimos
    return v;
}

export default function Cadastro() {
    const router = useRouter()

    const [nome, setNome] = useState('')
    const [cpf, setCpf] = useState('')
    const [email, setEmail] = useState('')
    const [telefone, setTelefone] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')

    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [camposComErro, setCamposComErro] = useState<Record<string, string>>({})

    const handleCadastrar = async () => {
        setErro(null)
        setCamposComErro({})

        if (!nome || !cpf || !email || !telefone || !senha || !confirmarSenha) {
            setErro('Preencha todos os campos para continuar.')
            return
        }

        if (senha !== confirmarSenha) {
            setErro('As senhas informadas não conferem.')
            return
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        // O backend exige o CPF apenas com números (sem pontos e traços)
        const cpfLimpo = cpf.replace(/\D/g, '')
        // O backend exige o Telefone apenas com números
        const telefoneLimpo = telefone.replace(/\D/g, '')

        if (cpfLimpo.length !== 11) {
            setErro('O CPF deve ter 11 dígitos.')
            return
        }

        if (telefoneLimpo.length < 10) {
            setErro('O Telefone deve ter DDD + número.')
            return
        }

        setLoading(true)
        try {
            const usuario = await criarUsuario({
                nomeCompleto: nome,
                tipoDocumento: 'CPF',
                documento: cpfLimpo, // Envia limpo
                email,
                telefone: telefoneLimpo, // Envia limpo
            })

            salvarUsuarioLogado(usuario.id)
            router.push('/tela-principal')
        } catch (erroCapturado) {
            if (erroCapturado instanceof ApiError) {
                setErro(erroCapturado.message)
                setCamposComErro(erroCapturado.campos)
            } else if (erroCapturado instanceof Error) {
                setErro(erroCapturado.message)
            } else {
                setErro('Não foi possível concluir o cadastro. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tela>
            <img src={"/bye.png"} className="w-60 h-10 object-contain mx-auto flex items-center justify-center mb-6"/>
            <SmartphoneHeader title="Seja bem-vindo" backToUrl="tela-login"/>
            <div className="text-center text-sm text-gray-500 font-normal leading-relaxed max-w-xs mx-auto -mt-3">
                Crie sua conta aqui no ByeBank!
            </div>
            <Card>
                <Input
                    label="Nome completo"
                    placeholder="Seu nome completo"
                    icon={<User className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
                <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCPF(e.target.value))}
                />
                <Input
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    icon={<Mail className="w-5 h-5 stroke-[1.8]" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    label="Telefone"
                    placeholder="(00) 90000-0000"
                    icon={<Phone className="w-5 h-5" />}
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))} // MÁSCARA AQUI
                />
                <Input
                    label="Senha"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                <Input
                    label="Confirmar senha"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                />

                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">Não foi possível cadastrar</span>
                            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
                            {Object.keys(camposComErro).length > 0 && (
                                <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                                    {Object.entries(camposComErro).map(([campo, mensagem]) => (
                                        <li key={campo}>{mensagem}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </Card>
            <BotaoGrande
                text="Cadastrar"
                bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                textClass="text-white font-semibold"
                widthClass="w-full"
                isLoading={loading}
                disabled={loading}
                onClick={handleCadastrar}
            />
        </Tela>
    )
}