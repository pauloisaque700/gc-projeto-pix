"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import BotaoGrande from '../../../components/BotaoGrande'
import { AlertCircle } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { removerConta, type Conta } from '../../../lib/api'
import { obterSessaoLocal, type SessaoLocal } from '../../../lib/session'
import { useDadosDaSessao } from '../../../lib/use-dados-da-sessao'

type StatusConta = Conta['status']

const LISTA_CONTAS = '/conta/minhas-contas-bancarias'
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
  const consulta = useSearchParams()
  const contaId = consulta.get('contaId')
  const origemLista = consulta.get('origem') === 'lista'
  const { sessao, dados, erro, recarregar } = useDadosDaSessao()
  const conta = dados?.contas.find((item) => item.id === contaId && item.usuarioId === dados.usuario.id)
  const voltarPara = origemLista || !conta
    ? LISTA_CONTAS
    : `/login/tela-perfil?contaId=${encodeURIComponent(conta.id)}`

  return <ConfirmarRemocao
    key={JSON.stringify([sessao.versao, contaId, origemLista])}
    sessao={sessao}
    conta={conta}
    voltarPara={voltarPara}
    carregando={!dados && !erro}
    erroSessao={erro}
    recarregar={recarregar}
  />
}

function ConfirmarRemocao({ sessao, conta, voltarPara, carregando, erroSessao, recarregar }: {
  sessao: SessaoLocal
  conta: Conta | undefined
  voltarPara: string
  carregando: boolean
  erroSessao: string | null
  recarregar: () => void
}) {
  const router = useRouter()
  const [removendo, setRemovendo] = useState(false)
  const [erroRemocao, setErroRemocao] = useState('')
  const remocaoEmAndamento = useRef(false)
  const confirmacaoAtiva = useRef(false)

  useEffect(() => {
    confirmacaoAtiva.current = true
    return () => { confirmacaoAtiva.current = false }
  }, [])

  const handleRemover = async () => {
    const sessaoValida = () => confirmacaoAtiva.current && obterSessaoLocal() === sessao
    if (!conta || remocaoEmAndamento.current || !sessaoValida()) return
    remocaoEmAndamento.current = true
    setRemovendo(true)
    setErroRemocao('')
    try {
      await removerConta(conta.id)
      if (sessaoValida()) router.replace(LISTA_CONTAS)
    } catch (error) {
      if (!sessaoValida()) return
      setErroRemocao(error instanceof Error ? error.message : 'Não foi possível remover a conta.')
      remocaoEmAndamento.current = false
      setRemovendo(false)
    }
  }

  const erro = erroSessao || erroRemocao

  return (
    <Tela>
      <SmartphoneHeader title="Remover Conta" backToUrl={removendo ? '' : voltarPara} />

      {carregando && <p role="status" className="text-center text-sm text-slate-500">Carregando conta...</p>}
      {erro && <p role="alert" className="text-center text-sm text-red-600">{erro}</p>}
      {erroSessao && <BotaoGrande text="Tentar novamente" onClick={recarregar} />}
      {!carregando && !erro && !conta && (
        <p role="status" className="text-center text-sm text-slate-600">A conta solicitada não está disponível nesta sessão.</p>
      )}

      {conta && <>
        <div className="w-20 h-20 mx-auto my-4 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center shadow-sm">
          <AlertCircle className="w-10 h-10 stroke-[1.8] text-red-500" />
        </div>
        <h2 className="text-center text-xl font-semibold text-slate-800 leading-snug px-2">
          Tem certeza que deseja remover esta conta?
        </h2>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {conta.tipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança'}
            </span>
            <span className={`flex items-center gap-1.5 text-sm font-semibold ${STATUS_CONTA[conta.status].corTexto}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONTA[conta.status].corPonto}`} />
              {STATUS_CONTA[conta.status].rotulo}
            </span>
          </div>
          <p className="text-base font-semibold text-slate-800">Ag {conta.agencia} · Conta {conta.numero}</p>
        </Card>

        <p className="text-center text-sm text-slate-400">Esta ação não pode ser desfeita.</p>

        <BotaoGrande
          text="Remover conta"
          bgClass="bg-red-500 hover:bg-red-600"
          textClass="text-white font-semibold"
          widthClass="w-full"
          isLoading={removendo}
          onClick={handleRemover}
        />
      </>}

      <BotaoGrande
        text="Cancelar"
        bgClass="bg-white border border-gray-200 hover:bg-gray-50"
        textClass="text-slate-700 font-semibold"
        widthClass="w-full"
        disabled={removendo}
        onClick={() => router.replace(voltarPara)}
      />
    </Tela>
  )
}
