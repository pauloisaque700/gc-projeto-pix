"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import BotaoGrande from '../../../components/BotaoGrande'
import { AlertCircle } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buscarConta, removerConta, type Conta } from '../../../lib/api'

type StatusConta = Conta['status']

const STATUS_CONTA: Record<StatusConta, { rotulo: string; corTexto: string; corPonto: string }> = {
  ATIVA: { rotulo: 'Ativa', corTexto: 'text-emerald-600', corPonto: 'bg-emerald-500' },
  BLOQUEADA: { rotulo: 'Bloqueada', corTexto: 'text-slate-400', corPonto: 'bg-slate-400' },
}

export default function RemoverConta() {
  return (
    <Suspense fallback={<Tela><p role="status">Carregando conta...</p></Tela>}>
      <ContaDaUrl />
    </Suspense>
  )
}

function ContaDaUrl() {
  const searchParams = useSearchParams()
  const contaId = searchParams.get('contaId')
  return <ConfirmarRemocao key={contaId} contaId={contaId} />
}

function ConfirmarRemocao({ contaId }: { contaId: string | null }) {
  const router = useRouter()

  const [tipoConta, setTipoConta] = useState('')
  const [agencia, setAgencia] = useState('')
  const [numeroConta, setNumeroConta] = useState('')
  const [status, setStatus] = useState<StatusConta | null>(null)

  const [carregando, setCarregando] = useState(Boolean(contaId))
  const [removendo, setRemovendo] = useState(false)
  const [erro, setErro] = useState(contaId ? '' : 'Nenhuma conta foi informada. Volte ao perfil e selecione uma conta.')
  const remocaoEmAndamento = useRef(false)

  useEffect(() => {
    if (!contaId) return
    let ativo = true
    buscarConta(contaId)
      .then((dados) => {
        if (!ativo) return
        setTipoConta(dados.tipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança')
        setAgencia(dados.agencia)
        setNumeroConta(dados.numero)
        setStatus(dados.status)
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar a conta.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [contaId])

  const handleRemover = async () => {
    if (!contaId || !status || carregando || remocaoEmAndamento.current) return
    remocaoEmAndamento.current = true
    setRemovendo(true)
    setErro('')
    try {
      await removerConta(contaId)
      router.push('/tela-principal')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível remover a conta.')
      remocaoEmAndamento.current = false
      setRemovendo(false)
    }
  }

  const statusAtual = status ? STATUS_CONTA[status] : null

  return (
    <Tela>
      <SmartphoneHeader title="Remover Conta" backToUrl="/login/tela-perfil" />

      <div className="w-20 h-20 mx-auto my-4 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center shadow-sm">
        <AlertCircle className="w-10 h-10 stroke-[1.8] text-red-500" />
      </div>

      <h2 className="text-center text-xl font-semibold text-slate-800 leading-snug px-2">
        Tem certeza que deseja remover esta conta?
      </h2>

      {carregando && <p role="status" className="text-center text-sm text-slate-500">Carregando conta...</p>}
      {erro && <p role="alert" className="text-center text-sm text-red-600">{erro}</p>}

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {tipoConta}
          </span>
          {statusAtual && (
            <span className={`flex items-center gap-1.5 text-sm font-semibold ${statusAtual.corTexto}`}>
              <span className={`w-2 h-2 rounded-full ${statusAtual.corPonto}`} />
              {statusAtual.rotulo}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-slate-800">
          {agencia || numeroConta ? `Ag ${agencia} · Conta ${numeroConta}` : ''}
        </p>
      </Card>

      <p className="text-center text-sm text-slate-400">Esta ação não pode ser desfeita.</p>

      <BotaoGrande
        text="Remover conta"
        bgClass="bg-red-500 hover:bg-red-600"
        textClass="text-white font-semibold"
        widthClass="w-full"
        isLoading={carregando || removendo}
        disabled={carregando || removendo || !contaId || !status}
        onClick={handleRemover}
      />

      <BotaoGrande
        text="Cancelar"
        bgClass="bg-white border border-gray-200 hover:bg-gray-50"
        textClass="text-slate-700 font-semibold"
        widthClass="w-full"
        disabled={removendo}
        onClick={() => router.push('/login/tela-perfil')}
      />
    </Tela>
  )
}
