"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { Landmark, Hash, User, Wallet, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type CanalNotificacao = 'email' | 'sms'

// Formato dos dados da conta. Quando o back-end existir, ele deve devolver este formato
// (ou basta ajustar a função preencherFormulario abaixo).
type DadosConta = {
  tipoConta: string
  agencia: string
  numeroConta: string
  titular: string
  limiteDiario: number // valor em reais, ex.: 100 ou 250.5
  notificacao: CanalNotificacao
}

const TIPOS_CONTA = ['Conta Corrente', 'Conta Poupança']

const OPCOES_NOTIFICACAO: { valor: CanalNotificacao; rotulo: string }[] = [
  { valor: 'email', rotulo: 'E-mail' },
  { valor: 'sms', rotulo: 'SMS' },
]

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function EditarConta() {
  const router = useRouter()

  const [tipoConta, setTipoConta] = useState('')
  const [agencia, setAgencia] = useState('')
  const [numeroConta, setNumeroConta] = useState('')
  const [titular, setTitular] = useState('')
  const [limite, setLimite] = useState('')
  const [notificacao, setNotificacao] = useState<CanalNotificacao | null>(null)

  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Preenche todos os campos a partir dos dados vindos do back-end.
  const preencherFormulario = (dados: DadosConta) => {
    setTipoConta(dados.tipoConta)
    setAgencia(dados.agencia)
    setNumeroConta(dados.numeroConta)
    setTitular(dados.titular)
    setLimite(formatarMoeda(dados.limiteDiario))
    setNotificacao(dados.notificacao)
  }

  useEffect(() => {
    // TODO: buscar os dados da conta no back-end e chamar preencherFormulario(dados).
    // Exemplo:
    // setCarregando(true)
    // buscarConta(id)
    //   .then(preencherFormulario)
    //   .catch(() => { /* tratar erro */ })
    //   .finally(() => setCarregando(false))
  }, [])

  const handleLimiteChange = (valor: string) => {
    const digitos = valor.replace(/\D/g, '')
    if (!digitos) {
      setLimite('')
      return
    }
    setLimite(formatarMoeda(Number(digitos) / 100))
  }

  // Monta o objeto que será enviado ao back-end.
  const montarPayload = () => ({
    tipoConta,
    agencia,
    numeroConta,
    titular,
    limiteDiario: Number(limite.replace(/\D/g, '')) / 100,
    notificacao,
  })

  const handleSalvar = async () => {
    // TODO: enviar montarPayload() ao back-end.
    // setSalvando(true)
    // try { await atualizarConta(id, montarPayload()) } finally { setSalvando(false) }
  }

  const handleRemover = async () => {
    // TODO: chamar o endpoint de remoção da conta no back-end.
  }

  return (
    <Tela>
      <SmartphoneHeader title="Editar conta" backToUrl="/tela-principal" />

      <Card>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Tipo de conta</label>
          <div className="relative">
            <select
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 outline-none focus:border-[#4F46E5] transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Selecione o tipo de conta
              </option>
              {TIPOS_CONTA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 stroke-[1.8] text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Input
          label="Agência"
          placeholder="Agência"
          icon={<Landmark className="w-5 h-5 stroke-[1.8]" />}
          type="text"
          value={agencia}
          onChange={(e) => setAgencia(e.target.value)}
        />
        <Input
          label="Número da conta"
          placeholder="Número da conta"
          icon={<Hash className="w-5 h-5 stroke-[1.8]" />}
          type="text"
          value={numeroConta}
          onChange={(e) => setNumeroConta(e.target.value)}
        />
        <Input
          label="Titular"
          placeholder="Titular"
          icon={<User className="w-5 h-5 stroke-[1.8]" />}
          type="text"
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
        />
        <Input
          label="Limite de Transação Diária"
          placeholder="R$0,00"
          icon={<Wallet className="w-5 h-5 stroke-[1.8]" />}
          type="text"
          value={limite}
          onChange={(e) => handleLimiteChange(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-600">Habilitar notificações por:</span>
          <div className="flex gap-3" role="radiogroup" aria-label="Canal de notificação">
            {OPCOES_NOTIFICACAO.map((opcao) => {
              const selecionado = notificacao === opcao.valor
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  role="radio"
                  aria-checked={selecionado}
                  onClick={() => setNotificacao(opcao.valor)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                    selecionado
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-semibold'
                      : 'border-gray-200 bg-white text-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selecionado ? 'border-[#4F46E5]' : 'border-gray-400'
                    }`}
                  >
                    {selecionado && <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />}
                  </span>
                  {opcao.rotulo}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <BotaoGrande
        text="Salvar alterações"
        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
        textClass="text-white font-semibold"
        widthClass="w-full"
        isLoading={carregando || salvando}
        disabled={carregando || salvando}
        onClick={handleSalvar}
      />

      <BotaoGrande
        text="Remover conta"
        bgClass="bg-red-500 hover:bg-red-600"
        textClass="text-white font-semibold"
        widthClass="w-full"
        disabled={carregando || salvando}
        onClick={() => router.push('/login/tela-remover-usuario')}
      />
    </Tela>
  )
}