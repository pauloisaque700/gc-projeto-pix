"use client"
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { Building2, Hash, User, Wallet, AlertCircle, ChevronDown } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buscarConta, buscarUsuario } from '../../../lib/api'
import { obterUsuarioLogado } from '../../../lib/session'

// Máscara simples de moeda: digita 10000 -> R$ 100,00
const formatarMoeda = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    if (!numeros) return ''
    const reais = (Number(numeros) / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return `R$ ${reais}`
}

export default function EditarConta() {
    return (
        <Suspense fallback={<Tela><p role="status">Carregando conta...</p></Tela>}>
            <ContaDaUrl />
        </Suspense>
    )
}

function ContaDaUrl() {
    const searchParams = useSearchParams()
    const contaId = searchParams.get('contaId')
    return <FormularioConta key={contaId} contaId={contaId} />
}

function FormularioConta({ contaId }: { contaId: string | null }) {
    const router = useRouter()

    const [tipoConta, setTipoConta] = useState('CORRENTE')
    const [agencia, setAgencia] = useState('')
    const [numeroConta, setNumeroConta] = useState('')
    const [titular, setTitular] = useState('')
    const [limite, setLimite] = useState('')
    const [notificacao, setNotificacao] = useState<'EMAIL' | 'SMS'>('EMAIL')

    const [carregando, setCarregando] = useState(Boolean(contaId))
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(
        contaId ? null : 'Nenhuma conta foi informada. Volte e selecione uma conta.'
    )

    useEffect(() => {
        if (!contaId) return
        let ativo = true

        async function carregar() {
            try {
                const conta = await buscarConta(contaId!)
                if (!ativo) return
                setTipoConta(conta.tipoConta)
                setAgencia(conta.agencia)
                setNumeroConta(conta.numero)

                const usuarioId = obterUsuarioLogado()
                if (usuarioId) {
                    const usuario = await buscarUsuario(usuarioId)
                    if (ativo) setTitular(usuario.nomeCompleto)
                }
            } catch (e) {
                if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar a conta.')
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        carregar()
        return () => { ativo = false }
    }, [contaId])

    const handleSalvar = async () => {
        setErro(null)

        if (!agencia || !numeroConta || !titular) {
            setErro('Preencha agência, número da conta e titular.')
            return
        }

        setSalvando(true)
        try {
            // TODO: chamar aqui a função de atualizar conta da sua API
            // await atualizarConta(contaId!, {
            //     tipoConta,
            //     agencia,
            //     numero: numeroConta,
            //     limiteDiario: Number(limite.replace(/\D/g, '')) / 100,
            //     notificacao,
            // })
            router.push('/tela-principal')
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível salvar as alterações.')
        } finally {
            setSalvando(false)
        }
    }

    const classeCampo =
        'w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-slate-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]'

    return (
        <Tela>
            <SmartphoneHeader title="Editar conta" backToUrl="/conta/minhas-contas-bancarias" />

            <div className="flex flex-col gap-6 w-full px-2">
                {/* Tipo de conta */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-500">Tipo de conta</label>
                    <div className="relative">
                        <select
                            value={tipoConta}
                            onChange={(e) => setTipoConta(e.target.value)}
                            className={classeCampo}
                        >
                            <option value="CORRENTE">Conta Corrente</option>
                            <option value="POUPANCA">Conta Poupança</option>
                        </select>
                        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <Input
                    label="Agência"
                    placeholder="0001"
                    icon={<Building2 className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                />

                <Input
                    label="Número da conta"
                    placeholder="12345-6"
                    icon={<Hash className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={numeroConta}
                    onChange={(e) => setNumeroConta(e.target.value)}
                />

                <Input
                    label="Titular"
                    placeholder="Nome do titular"
                    icon={<User className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={titular}
                    onChange={(e) => setTitular(e.target.value)}
                />

                <Input
                    label="Limite de Transação Diária"
                    placeholder="R$ 0,00"
                    icon={<Wallet className="w-5 h-5 stroke-[1.8]" />}
                    type="text"
                    value={limite}
                    onChange={(e) => setLimite(formatarMoeda(e.target.value))}
                />

                {/* Notificações */}
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-slate-500">Habilitar Notificações Por:</span>
                    <div className="flex gap-3">
                        {(['EMAIL', 'SMS'] as const).map((opcao) => {
                            const selecionado = notificacao === opcao
                            return (
                                <button
                                    key={opcao}
                                    type="button"
                                    onClick={() => setNotificacao(opcao)}
                                    className={`flex items-center gap-3 px-4 h-12 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                                        selecionado
                                            ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                                            : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selecionado ? 'border-[#4F46E5]' : 'border-gray-300'
                                        }`}
                                    >
                                        {selecionado && <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />}
                                    </span>
                                    {opcao === 'EMAIL' ? 'E-mail' : 'SMS'}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                        <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 w-full px-2 mt-6">
                <BotaoGrande
                    text="Salvar alterações"
                    bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                    textClass="text-white font-semibold"
                    widthClass="w-full"
                    isLoading={carregando || salvando}
                    disabled={carregando || salvando || !contaId}
                    onClick={handleSalvar}
                />

                <BotaoGrande
                    text="Remover conta"
                    bgClass="bg-red-500 hover:bg-red-600"
                    textClass="text-white font-semibold"
                    widthClass="w-full"
                    disabled={carregando || salvando || !contaId}
                    onClick={() => {
                        if (contaId) router.push(`/login/tela-remover-conta?contaId=${encodeURIComponent(contaId)}`)
                    }}
                />
            </div>
        </Tela>
    )
}