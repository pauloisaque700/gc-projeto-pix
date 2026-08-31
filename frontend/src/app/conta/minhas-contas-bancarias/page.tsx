"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Tela from "../../../components/Tela"
import SmartphoneHeader from "../../../components/SmartphoneHeader"
import Card from "../../../components/Card"
import Input from "../../../components/Input"
import BotaoGrande from "../../../components/BotaoGrande"
import { Wallet, Plus, AlertCircle, Trash2, Hash, Building2 } from "lucide-react"
import {
  ContaBancariaResponse,
  criarConta,
  listarContasDoUsuario,
  removerConta,
  ApiError,
} from "../../../lib/api"
import { obterUsuarioLogado } from "../../../lib/session"

export default function MinhasContasBancarias() {
  const router = useRouter()

  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [contas, setContas] = useState<ContaBancariaResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [agencia, setAgencia] = useState('')
  const [numero, setNumero] = useState('')
  const [criando, setCriando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState<string | null>(null)

  const [removendoId, setRemovendoId] = useState<string | null>(null)

  async function carregarContas(idUsuario: string) {
    try {
      setCarregando(true)
      const dados = await listarContasDoUsuario(idUsuario)
      setContas(dados)
      setErro(null)
    } catch {
      setErro('Não foi possível carregar suas contas bancárias.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    const idSalvo = obterUsuarioLogado()
    if (!idSalvo) {
      setCarregando(false)
      setErro('Nenhum usuário cadastrado nesta sessão. Cadastre-se para continuar.')
      return
    }
    setUsuarioId(idSalvo)
    carregarContas(idSalvo)
  }, [])

  const handleCriarConta = async () => {
    if (!usuarioId) return

    setErroFormulario(null)

    if (!agencia || !numero) {
      setErroFormulario('Informe a agência e o número da conta.')
      return
    }

    setCriando(true)
    try {
      await criarConta({ usuarioId, agencia, numero })
      setAgencia('')
      setNumero('')
      setMostrarFormulario(false)
      await carregarContas(usuarioId)
    } catch (erroCapturado) {
      if (erroCapturado instanceof ApiError) {
        setErroFormulario(erroCapturado.message)
      } else if (erroCapturado instanceof Error) {
        setErroFormulario(erroCapturado.message)
      } else {
        setErroFormulario('Não foi possível criar a conta. Tente novamente.')
      }
    } finally {
      setCriando(false)
    }
  }

  const handleRemoverConta = async (id: string) => {
    if (!usuarioId) return
    setRemovendoId(id)
    try {
      await removerConta(id)
      await carregarContas(usuarioId)
    } catch {
      setErro('Não foi possível remover a conta selecionada.')
    } finally {
      setRemovendoId(null)
    }
  }

  const formatarSaldo = (saldo: number) =>
    saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Tela>
      <SmartphoneHeader title="Minhas Contas" backToUrl="/login/tela-perfil" />

      <div className="flex flex-col gap-6 px-1 py-2 font-sans w-full max-w-[400px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-slate-700">Contas bancárias</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gerencie as contas vinculadas ao seu perfil ByeBank.
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {usuarioId && contas.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma conta cadastrada ainda.</p>
            )}

            {contas.map((conta) => (
              <Card
                key={conta.id}
                paddingClass="p-4"
                roundedClass="rounded-2xl"
                borderClass="border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-[#4F46E5] stroke-[1.8]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        Ag. {conta.agencia} • Conta {conta.numero}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Saldo: R$ {formatarSaldo(conta.saldo)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverConta(conta.id)}
                    disabled={removendoId === conta.id}
                    aria-label="Remover conta"
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {usuarioId && mostrarFormulario && (
          <Card paddingClass="p-4" roundedClass="rounded-2xl">
            <div className="flex flex-col gap-4">
              <Input
                label="Agência"
                placeholder="0001"
                icon={<Building2 className="w-5 h-5 stroke-[1.8]" />}
                value={agencia}
                onChange={(e) => setAgencia(e.target.value.replace(/\D/g, ''))}
              />
              <Input
                label="Número da conta"
                placeholder="123456"
                icon={<Hash className="w-5 h-5 stroke-[1.8]" />}
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
              />

              {erroFormulario && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
                  <p className="text-xs text-red-600 leading-relaxed">{erroFormulario}</p>
                </div>
              )}

              <BotaoGrande
                text="Criar conta"
                bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
                textClass="text-white font-semibold"
                widthClass="w-full"
                isLoading={criando}
                disabled={!agencia || !numero || criando}
                onClick={handleCriarConta}
              />
            </div>
          </Card>
        )}

        {usuarioId && (
          <div className="flex flex-col gap-1 mt-2">
            <BotaoGrande
              text={mostrarFormulario ? "Cancelar" : "Adicionar conta"}
              bgClass={mostrarFormulario ? "bg-white hover:bg-slate-50" : "bg-[#4F46E5] hover:bg-[#4338CA]"}
              borderClass={mostrarFormulario ? "border border-slate-200" : "border border-transparent"}
              textClass={mostrarFormulario ? "text-slate-600 font-semibold" : "text-white font-semibold"}
              widthClass="w-full"
              icon={!mostrarFormulario ? <Plus className="w-4 h-4 stroke-[2.5]" /> : undefined}
              onClick={() => setMostrarFormulario((valor) => !valor)}
            />
          </div>
        )}

        {!usuarioId && !carregando && (
          <BotaoGrande
            text="Ir para cadastro"
            bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
            textClass="text-white font-semibold"
            widthClass="w-full"
            onClick={() => router.push('/login/cadastrar-usuario')}
          />
        )}
      </div>
    </Tela>
  )
}
