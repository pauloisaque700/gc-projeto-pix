"use client"
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CreditCard, ChevronDown, AlertCircle, User, Phone } from 'lucide-react'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Card from '../../../components/Card'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { buscarConta, ApiError } from '../../../lib/api'

type TipoChave = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE'

type ContaOpcao = { id: string; rotulo: string }

const TIPOS: { valor: TipoChave; rotulo: string }[] = [
    { valor: 'CPF', rotulo: 'CPF' },
    { valor: 'CNPJ', rotulo: 'CNPJ' },
    { valor: 'EMAIL', rotulo: 'E-mail' },
    { valor: 'TELEFONE', rotulo: 'Telefone' },
]

// ---------- Máscaras ----------
const formatarCPF = (valor: string) =>
    valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')

const formatarCNPJ = (valor: string) =>
    valor
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')

const formatarTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d)(\d{4})$/, '$1-$2')
    return v
}

const aplicarMascara = (tipo: TipoChave, valor: string) => {
    if (tipo === 'CPF') return formatarCPF(valor)
    if (tipo === 'CNPJ') return formatarCNPJ(valor)
    if (tipo === 'TELEFONE') return formatarTelefone(valor)
    return valor.trim()
}

const PLACEHOLDERS: Record<TipoChave, string> = {
    CPF: '000.000.000-00',
    CNPJ: '00.000.000/0000-00',
    EMAIL: 'Digite sua chave PIX',
    TELEFONE: '(00) 90000-0000',
}

const validarChave = (tipo: TipoChave, chave: string): string | null => {
    const numeros = chave.replace(/\D/g, '')
    if (!chave.trim()) return 'Informe a chave PIX.'
    if (tipo === 'CPF' && numeros.length !== 11) return 'O CPF deve ter 11 dígitos.'
    if (tipo === 'CNPJ' && numeros.length !== 14) return 'O CNPJ deve ter 14 dígitos.'
    if (tipo === 'TELEFONE' && numeros.length < 10) return 'O telefone deve ter DDD + número.'
    if (tipo === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) return 'Informe um e-mail válido.'
    return null
}

export default function CadastrarChavePix() {
    return (
        <Suspense fallback={<Tela><p role="status">Carregando...</p></Tela>}>
            <ContaDaUrl />
        </Suspense>
    )
}

function ContaDaUrl() {
    const searchParams = useSearchParams()
    const contaId = searchParams.get('contaId')
    return <PassoValidacao key={contaId} contaIdInicial={contaId} />
}

function PassoValidacao({ contaIdInicial }: { contaIdInicial: string | null }) {
    const router = useRouter()

    const [tipo, setTipo] = useState<TipoChave>('EMAIL')
    const [chave, setChave] = useState('')
    const [contas, setContas] = useState<ContaOpcao[]>([])
    const [contaId, setContaId] = useState(contaIdInicial ?? '')

    const [carregando, setCarregando] = useState(Boolean(contaIdInicial))
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        if (!contaIdInicial) return
        let ativo = true

        // TODO: se existir uma função que lista todas as contas do usuário logado
        // (ex.: listarContas(obterUsuarioLogado())), use-a aqui no lugar de buscarConta.
        buscarConta(contaIdInicial)
            .then((conta) => {
                if (!ativo) return
                const nome = conta.tipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança'
                setContas([{ id: contaIdInicial, rotulo: `${nome} ****${conta.numero.replace(/\D/g, '').slice(-4)}` }])
                setContaId(contaIdInicial)
            })
            .catch((e) => {
                if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar a conta.')
            })
            .finally(() => { if (ativo) setCarregando(false) })

        return () => { ativo = false }
    }, [contaIdInicial])

    const trocarTipo = (novo: TipoChave) => {
        setTipo(novo)
        setChave('') // a máscara muda, então limpa o campo
        setErro(null)
    }

    const iconeChave =
        tipo === 'EMAIL' ? <Mail className="w-5 h-5 stroke-[1.8]" />
        : tipo === 'TELEFONE' ? <Phone className="w-5 h-5 stroke-[1.8]" />
        : <User className="w-5 h-5 stroke-[1.8]" />

    const handleValidar = async () => {
        setErro(null)

        const problema = validarChave(tipo, chave)
        if (problema) {
            setErro(problema)
            return
        }
        if (!contaId) {
            setErro('Selecione a conta para recebimento.')
            return
        }

        // O backend recebe CPF, CNPJ e telefone só com números
        const chaveLimpa = tipo === 'EMAIL' ? chave.trim() : chave.replace(/\D/g, '')

        setLoading(true)
        try {
            // TODO: chamar aqui a validação da chave na sua API, por exemplo:
            // await validarChavePix({ contaId, tipo, chave: chaveLimpa })
            const params = new URLSearchParams({ contaId, tipo, chave: chaveLimpa })
            router.push(`/login/tela-confirmar-chave-pix?${params.toString()}`)
        } catch (e) {
            if (e instanceof ApiError || e instanceof Error) {
                setErro(e.message)
            } else {
                setErro('Não foi possível validar a chave. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tela>
            <SmartphoneHeader title="Cadastrar chave PIX" backToUrl="/pix/minhas-chaves-pix" />

            <Card paddingClass="p-5" bgClass="bg-white">
                <div className="flex flex-col gap-6">
                    {/* Tipo de chave */}
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-semibold text-slate-700">Tipo de chave</span>
                        <div className="grid grid-cols-2 gap-3">
                            {TIPOS.map((opcao) => {
                                const selecionado = tipo === opcao.valor
                                return (
                                    <button
                                        key={opcao.valor}
                                        type="button"
                                        onClick={() => trocarTipo(opcao.valor)}
                                        className={`flex items-center gap-3 px-4 h-14 rounded-xl border-2 text-base font-medium cursor-pointer transition-colors ${
                                            selecionado
                                                ? 'border-[#4F46E5] bg-white text-[#4F46E5]'
                                                : 'border-gray-200 bg-white text-slate-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selecionado ? 'border-[#4F46E5]' : 'border-gray-400'
                                            }`}
                                        >
                                            {selecionado && <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />}
                                        </span>
                                        {opcao.rotulo}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Chave */}
                    <Input
                        label="Chave"
                        placeholder={PLACEHOLDERS[tipo]}
                        icon={iconeChave}
                        type={tipo === 'EMAIL' ? 'email' : tipo === 'TELEFONE' ? 'tel' : 'text'}
                        value={chave}
                        onChange={(e) => setChave(aplicarMascara(tipo, e.target.value))}
                    />

                    {/* Conta para recebimento */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">Conta para recebimento</label>
                        <div className="relative">
                            <CreditCard className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={contaId}
                                onChange={(e) => setContaId(e.target.value)}
                                disabled={carregando || contas.length === 0}
                                className="w-full h-12 pl-12 pr-10 rounded-xl border border-gray-200 bg-white text-slate-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                            >
                                {contas.length === 0 && (
                                    <option value="">{carregando ? 'Carregando...' : 'Nenhuma conta disponível'}</option>
                                )}
                                {contas.map((c) => (
                                    <option key={c.id} value={c.id}>{c.rotulo}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {erro && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
                        </div>
                    )}

                    <BotaoGrande
                        text="Validar chave"
                        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                        textClass="text-white font-semibold"
                        widthClass="w-full"
                        isLoading={loading}
                        disabled={carregando || loading || !chave || !contaId}
                        onClick={handleValidar}
                    />
                </div>
            </Card>
        </Tela>
    )
}