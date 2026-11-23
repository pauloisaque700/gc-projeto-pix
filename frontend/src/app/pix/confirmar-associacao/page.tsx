"use client"
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Check, ShieldCheck, AlertCircle } from 'lucide-react'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Card from '../../../components/Card'
import BotaoGrande from '../../../components/BotaoGrande'
import { buscarConta, ApiError } from '../../../lib/api'

type TipoChave = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE'

const TIPOS_VALIDOS: TipoChave[] = ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE']

// A chave chega só com números (exceto e-mail); aqui ela volta a ficar legível
const formatarChaveParaExibir = (tipo: TipoChave, chave: string) => {
    const n = chave.replace(/\D/g, '')
    if (tipo === 'CPF' && n.length === 11)
        return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    if (tipo === 'CNPJ' && n.length === 14)
        return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    if (tipo === 'TELEFONE' && n.length >= 10)
        return n.length === 11
            ? n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            : n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    return chave
}

export default function ConfirmarChavePix() {
    return (
        <Suspense fallback={<Tela><p role="status">Carregando...</p></Tela>}>
            <DadosDaUrl />
        </Suspense>
    )
}

function DadosDaUrl() {
    const searchParams = useSearchParams()
    const contaId = searchParams.get('contaId')
    const tipo = searchParams.get('tipo')
    const chave = searchParams.get('chave')
    return (
        <PassoConfirmacao
            key={`${contaId}-${tipo}-${chave}`}
            contaId={contaId}
            tipo={tipo}
            chave={chave}
        />
    )
}

function PassoConfirmacao({
    contaId,
    tipo,
    chave,
}: {
    contaId: string | null
    tipo: string | null
    chave: string | null
}) {
    const router = useRouter()

    const dadosCompletos =
        Boolean(contaId) && Boolean(chave) && TIPOS_VALIDOS.includes(tipo as TipoChave)

    const [contaMascarada, setContaMascarada] = useState('')
    const [carregando, setCarregando] = useState(dadosCompletos)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(
        dadosCompletos ? null : 'Dados da chave não informados. Volte ao passo 1 e valide a chave.'
    )

    useEffect(() => {
        if (!dadosCompletos || !contaId) return
        let ativo = true
        buscarConta(contaId)
            .then((conta) => {
                if (!ativo) return
                setContaMascarada(`****${conta.numero.replace(/\D/g, '').slice(-4)}`)
            })
            .catch((e) => {
                if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar a conta.')
            })
            .finally(() => { if (ativo) setCarregando(false) })
        return () => { ativo = false }
    }, [dadosCompletos, contaId])

    const handleConfirmar = async () => {
        if (!dadosCompletos || loading) return
        setErro(null)
        setLoading(true)
        try {
            // PENDENTE: falta a função da API que cadastra a chave PIX na conta.
            // Não vou inventar o nome nem o formato. Quando eu souber, entra aqui:
            // await cadastrarChavePix({ contaId, tipo, chave })
            // router.push('/tela-principal')
            throw new Error('A chamada que cadastra a chave PIX ainda não foi conectada.')
        } catch (e) {
            if (e instanceof ApiError || e instanceof Error) {
                setErro(e.message)
            } else {
                setErro('Não foi possível confirmar a associação. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tela>
            <SmartphoneHeader title="Cadastrar chave PIX" backToUrl="/pix/adicionar-chave" />

            <Card paddingClass="p-5" bgClass="bg-white">
                <div className="flex flex-col gap-6">
                    {dadosCompletos && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-emerald-200">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 stroke-[2]" />
                                <span className="flex items-center gap-1.5 text-lg font-bold text-emerald-600">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    Chave válida
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500">Chave:</span>
                                    <span className="font-semibold text-slate-900 break-all text-right">
                                        {formatarChaveParaExibir(tipo as TipoChave, chave!)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500">Conta:</span>
                                    <span className="font-semibold text-slate-900">
                                        {carregando ? 'Carregando...' : contaMascarada}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#4F46E5] shrink-0 stroke-[1.8]" />
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Seus dados estão protegidos por criptografia ponta a ponta.
                        </p>
                    </div>

                    {erro && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
                        </div>
                    )}

                    <BotaoGrande
                        text="Confirmar associação"
                        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                        textClass="text-white font-semibold"
                        widthClass="w-full"
                        isLoading={loading}
                        disabled={carregando || loading || !dadosCompletos}
                        onClick={handleConfirmar}
                    />
                </div>
            </Card>
        </Tela>
    )
}