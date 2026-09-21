"use client"
import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import {
  Bell,
  Eye,
  ArrowUp,
  ArrowDown,
  KeyRound,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Home,
  Wallet,
  Diamond,
  User,
} from "lucide-react"
import Tela from "../../components/Tela"
import Card from "../../components/Card"

interface UsuarioData {
  nome: string
  fotoUrl: string
  saldo: number
  agencia: string
  conta: string
  categoria: string
  transacoes: {
    id: string
    tipo: 'PIX enviado' | 'PIX recebido' | 'Pagamento'
    descricao: string
    valor: number
    data: string
  }[]
}

export default function Inicio() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<UsuarioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDadosUsuario() {
      try {
        setLoading(true)
        const response = await fetch('../../lib/api.ts')
        if (!response.ok) throw new Error('Falha ao buscar dados do usuário')
        
        const data = await response.json()
        setUsuario(data)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosUsuario()
  }, [])

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return (
    <Tela>
      <div className="w-full max-w-[400px] min-h-screen bg-white font-sans pb-24">

        <div className="flex items-center justify-between px-1 pt-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200">
              <img
                src={usuario?.fotoUrl || "/foto-perfil.jpg"}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-slate-400">Olá,</span>
              <span className="text-xl font-bold text-slate-900">
                {usuario?.nome || "Usuário"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/notificacao")}
            className="w-11 h-11 rounded-full bg-[#161F31] border border-[#263650] flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-white" strokeWidth={2} />
            <span className="absolute ml-5 mb-5 w-3 h-3 rounded-full bg-[#00E889] border-2 border-[#161F31]" />
          </button>
        </div>

        <Card
          paddingClass="p-5"
          roundedClass="rounded-[32px]"
          borderClass="border border-[#263650] bg-[#161F31]"
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xl text-slate-400">SALDO DISPONÍVEL</span>
              <Eye className="w-7 h-7 text-slate-400" strokeWidth={2} />
            </div>

            <span className="text-5xl leading-none font-bold text-white mt-8">
              {usuario?.saldo !== undefined ? formatarMoeda(usuario.saldo) : "R$ 0,00"}
            </span>

            <div className="h-px bg-[#263650] my-5" />

            <div className="flex items-center justify-between">
              <span className="text-lg text-slate-400">
                Ag {usuario?.agencia} · Conta {usuario?.conta}
              </span>

              <span className="text-lg font-bold text-[#00E889]">
                {usuario?.categoria || "EMERALD"}
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            type="button"
            onClick={() => router.push("/pix/transferir-pix")}
            className="h-[132px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowUp className="w-8 h-8 text-[#00E889]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Enviar PIX</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pix/receber")}
            className="h-[132px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowDown className="w-8 h-8 text-[#00E889]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Receber PIX</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pix/minhas-chaves-pix")}
            className="h-[132px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-[#00E889]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Minhas Chaves</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/conta/minhas-contas-bancarias")}
            className="h-[132px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-[#00E889]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Minhas Contas</span>
          </button>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Últimas transações
            </h2>
            <button type="button" className="text-lg font-bold text-[#00C978]">
              Ver tudo
            </button>
          </div>

          <div className="flex flex-col">
            {usuario?.transacoes?.map((t) => {
              const isEntrada = t.valor > 0
              return (
                <div key={t.id} className="flex items-center gap-4 py-4 border-b border-[#263650]">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isEntrada ? 'bg-[#07352E]' : 'bg-[#301822]'}`}>
                    {isEntrada ? (
                      <ArrowDownLeft className="w-7 h-7 text-[#00E889]" strokeWidth={2.5} />
                    ) : (
                      <ArrowUpRight className="w-7 h-7 text-[#FF5B65]" strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-lg font-bold text-slate-900">
                      {t.tipo}
                    </span>
                    <span className="block text-base text-slate-400 mt-1">
                      {t.descricao}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${isEntrada ? 'text-[#00E889]' : 'text-slate-900'}`}>
                      {isEntrada ? `+ ${formatarMoeda(t.valor)}` : `- ${formatarMoeda(Math.abs(t.valor))}`}
                    </span>
                    <span className="text-base text-slate-400 mt-1">
                      {t.data}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#161F31] border-t border-[#263650]">
          <div className="w-full max-w-[400px] mx-auto h-[95px] flex items-center justify-around">
            <button type="button" className="flex flex-col items-center gap-1.5 text-[#00E889]">
              <Home className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs font-semibold">Início</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/conta/minhas-contas-bancarias")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <Wallet className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">Contas</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <Diamond className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">PIX</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/login/tela-perfil")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <User className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">Perfil</span>
            </button>
          </div>
        </div>

      </div>
    </Tela>
  )
}