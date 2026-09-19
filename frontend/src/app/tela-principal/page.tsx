"use client"

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

export default function Inicio() {
  const router = useRouter()

  return (
    <Tela>
      <div className="w-full max-w-[400px] min-h-screen bg-white font-sans pb-24">

        <div className="flex items-center justify-between px-1 pt-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200">
              <img
                src="/foto-perfil.jpg"
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-slate-400">
                Olá,
              </span>
              <span className="text-xl font-bold text-slate-900">
                João Silva
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/notificacao")}
            className="w-11 h-11 rounded-full bg-[#161F31] border border-[#263650] flex items-center justify-center"
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
              <span className="text-xl text-slate-400">
                SALDO DISPONÍVEL
              </span>

              <Eye
                className="w-7 h-7 text-slate-400"
                strokeWidth={2}
              />
            </div>

            <span className="text-5xl leading-none font-bold text-white mt-8">
              R$ 12.450,00
            </span>

            <div className="h-px bg-[#263650] my-7" />

            <div className="flex items-center justify-between">
              <span className="text-lg text-slate-400">
                Ag 0001 · Conta 12345-6
              </span>

              <span className="text-lg font-bold text-[#00E889]">
                EMERALD
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            type="button"
            onClick={() => router.push("/pix/transferir-pix")}
            className="h-[155px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowUp
                className="w-8 h-8 text-[#00E889]"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-bold text-white">
              Enviar PIX
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pix/receber")}
            className="h-[155px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowDown
                className="w-8 h-8 text-[#00E889]"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-bold text-white">
              Receber PIX
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pix/minhas-chaves-pix")}
            className="h-[155px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <KeyRound
                className="w-8 h-8 text-[#00E889]"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-bold text-white">
              Minhas Chaves
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/conta/minhas-contas-bancarias")}
            className="h-[155px] rounded-[26px] bg-[#161F31] border border-[#263650] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <CreditCard
                className="w-8 h-8 text-[#00E889]"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-bold text-white">
              Minhas Contas
            </span>
          </button>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Últimas transações
            </h2>

            <button
              type="button"
              className="text-lg font-bold text-[#00C978]"
            >
              Ver tudo
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-4 py-4 border-b border-[#263650]">
              <div className="w-16 h-16 rounded-full bg-[#301822] flex items-center justify-center shrink-0">
                <ArrowUpRight
                  className="w-7 h-7 text-[#FF5B65]"
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-lg font-bold text-slate-900">
                  PIX enviado
                </span>

                <span className="block text-base text-slate-400 mt-1">
                  Maria Silva
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-slate-900">
                  - R$ 150,00
                </span>

                <span className="text-base text-slate-400 mt-1">
                  Hoje
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-[#263650]">
              <div className="w-16 h-16 rounded-full bg-[#07352E] flex items-center justify-center shrink-0">
                <ArrowDownLeft
                  className="w-7 h-7 text-[#00E889]"
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-lg font-bold text-slate-900">
                  PIX recebido
                </span>

                <span className="block text-base text-slate-400 mt-1">
                  Carlos Souza
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-[#00E889]">
                  + R$ 500,00
                </span>

                <span className="text-base text-slate-400 mt-1">
                  Ontem
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-[#263650]">
              <div className="w-16 h-16 rounded-full bg-[#301822] flex items-center justify-center shrink-0">
                <ArrowUpRight
                  className="w-7 h-7 text-[#FF5B65]"
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-lg font-bold text-slate-900">
                  Pagamento
                </span>

                <span className="block text-base text-slate-400 mt-1">
                  Conta de luz
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-slate-900">
                  - R$ 230,00
                </span>

                <span className="text-base text-slate-400 mt-1">
                  20/08
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#161F31] border-t border-[#263650]">
          <div className="w-full max-w-[400px] mx-auto h-[95px] flex items-center justify-around">
            <button
              type="button"
              className="flex flex-col items-center gap-1.5 text-[#00E889]"
            >
              <Home className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs font-semibold">
                Início
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/conta/minhas-contas-bancarias")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <Wallet className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">
                Contas
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/conta/minhas-contas-bancarias")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <Diamond className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">
                PIX
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/login/tela-perfil")}
              className="flex flex-col items-center gap-1.5 text-slate-400"
            >
              <User className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-xs">
                Perfil
              </span>
            </button>
          </div>
        </div>
      </div>
    </Tela>
  )
}