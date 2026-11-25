"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import BotaoGrande from '../../../components/BotaoGrande'
import { AlertCircle } from 'lucide-react'
import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { removerConta, type Conta } from '../../../lib/api'
import { obterSessaoLocal, type SessaoLocal } from '../../../lib/session'
import { useDadosDaSessao } from '../../../lib/use-dados-da-sessao'

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
  const { dados, erro, sessao } = useDadosDaSessao()
  const conta = dados?.contas.find((item) => item.id === contaId)
  const voltar = searchParams.get('origem') === 'lista'
    ? '/conta/minhas-contas-bancarias'
    : '/login/tela-perfil'

  return (
    <ConfirmarRemocao
      key={`${sessao.versao}:${searchParams}`}
      conta={conta}
      sessao={sessao}
      voltar={voltar}
      carregando={Boolean(contaId && !dados && !erro)}
      erroDaConta={erro ?? (!contaId || (dados && !conta) ? 'Selecione uma conta da sua sessão para remover.' : '')}
    />
  )
}

function ConfirmarRemocao({ conta, sessao, voltar, carregando, erroDaConta }: {
  conta?: Conta
  sessao: SessaoLocal
  voltar: string
  carregando: boolean
  erroDaConta: string
}) {
  const router = useRouter()
  const [removendo, setRemovendo] = useState(false)
  const [erro, setErro] = useState('')
  const remocaoEmAndamento = useRef(false)

  const handleRemover = async () => {
    if (!conta || obterSessaoLocal() !== sessao || remocaoEmAndamento.current) return
    remocaoEmAndamento.current = true
    setRemovendo(true)
    setErro('')
    try {
      await removerConta(conta.id)
      if (obterSessaoLocal() === sessao) router.replace(voltar)
    } catch (error) {
      if (obterSessaoLocal() !== sessao) return
      setErro(error instanceof Error ? error.message : 'Não foi possível remover a conta.')
      remocaoEmAndamento.current = false
      setRemovendo(false)
    }
  }

  const statusAtual = conta ? STATUS_CONTA[conta.status] : null
  const mensagem = erroDaConta || erro

  return (
    <Tela>
      <SmartphoneHeader title="Remover Conta" backToUrl={voltar} />

      <div className="w-20 h-20 mx-auto my-4 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center shadow-sm">
        <AlertCircle className="w-10 h-10 stroke-[1.8] text-red-500" />
      </div>

      <h2 className="text-center text-xl font-semibold text-slate-800 leading-snug px-2">
        Tem certeza que deseja remover esta conta?
      </h2>

      {carregando && <p role="status" className="text-center text-sm text-slate-500">Carregando conta...</p>}
      {mensagem && <p role="alert" className="text-center text-sm text-red-600">{mensagem}</p>}

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {conta && (conta.tipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança')}
          </span>
          {statusAtual && (
            <span className={`flex items-center gap-1.5 text-sm font-semibold ${statusAtual.corTexto}`}>
              <span className={`w-2 h-2 rounded-full ${statusAtual.corPonto}`} />
              {statusAtual.rotulo}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-slate-800">
          {conta && `Ag ${conta.agencia} · Conta ${conta.numero}`}
        </p>
      </Card>

      <p className="text-center text-sm text-slate-400">Esta ação não pode ser desfeita.</p>

      <BotaoGrande
        text="Remover conta"
        bgClass="bg-red-500 hover:bg-red-600"
        textClass="text-white font-semibold"
        widthClass="w-full"
        isLoading={carregando || removendo}
        disabled={carregando || removendo || !conta}
        onClick={handleRemover}
      />

      <BotaoGrande
        text="Cancelar"
        bgClass="bg-white border border-gray-200 hover:bg-gray-50"
        textClass="text-slate-700 font-semibold"
        widthClass="w-full"
        disabled={removendo}
        onClick={() => router.push(voltar)}
      />
    </Tela>
  )
}
