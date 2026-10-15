"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import BotaoGrande from '../../../components/BotaoGrande'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type StatusConta = 'ativa' | 'inativa'

// Formato dos dados da conta que será removida. O back-end deve devolver este formato
// (ou basta ajustar a função preencherConta abaixo).
type DadosContaRemocao = {
  tipoConta: string
  agencia: string
  numeroConta: string
  status: StatusConta
}

const STATUS_CONTA: Record<StatusConta, { rotulo: string; corTexto: string; corPonto: string }> = {
  ativa: { rotulo: 'Ativa', corTexto: 'text-emerald-600', corPonto: 'bg-emerald-500' },
  inativa: { rotulo: 'Inativa', corTexto: 'text-slate-400', corPonto: 'bg-slate-400' },
}

export default function RemoverConta() {
  const router = useRouter()

  const [tipoConta, setTipoConta] = useState('')
  const [agencia, setAgencia] = useState('')
  const [numeroConta, setNumeroConta] = useState('')
  const [status, setStatus] = useState<StatusConta | null>(null)

  const [carregando, setCarregando] = useState(false)
  const [removendo, setRemovendo] = useState(false)

  // Preenche os campos a partir dos dados vindos do back-end.
  const preencherConta = (dados: DadosContaRemocao) => {
    setTipoConta(dados.tipoConta)
    setAgencia(dados.agencia)
    setNumeroConta(dados.numeroConta)
    setStatus(dados.status)
  }

  useEffect(() => {
    // TODO: buscar os dados da conta no back-end e chamar preencherConta(dados).
    // Exemplo:
    // setCarregando(true)
    // buscarConta(id)
    //   .then(preencherConta)
    //   .catch(() => { /* tratar erro */ })
    //   .finally(() => setCarregando(false))
  }, [])

  const handleRemover = async () => {
    // TODO: chamar o endpoint de remoção da conta no back-end.
    // setRemovendo(true)
    // try { await removerConta(id); router.push('/tela-principal') } finally { setRemovendo(false) }
  }

  const statusAtual = status ? STATUS_CONTA[status] : null

  return (
    <Tela>
      <SmartphoneHeader title="Remover Conta" backToUrl="/tela-perfil" />

      <div className="w-20 h-20 mx-auto my-4 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center shadow-sm">
        <AlertCircle className="w-10 h-10 stroke-[1.8] text-red-500" />
      </div>

      <h2 className="text-center text-xl font-semibold text-slate-800 leading-snug px-2">
        Tem certeza que deseja remover esta conta?
      </h2>

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
        disabled={carregando || removendo}
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