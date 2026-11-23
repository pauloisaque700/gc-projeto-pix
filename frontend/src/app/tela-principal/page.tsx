"use client"
import Image from "next/image"
import Link from "next/link"
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
import { formatarDataPix, formatarMoeda, linkDetalhesPix } from "../../lib/pix"
import { useDadosDaSessao } from "../../lib/use-dados-da-sessao"
import { useExtratoPix } from "../../lib/use-extrato-pix"

export default function Inicio() {
  const router = useRouter()
  const { dados, erro, recarregar } = useDadosDaSessao()
  const conta = dados?.contas[0]
  const extrato = useExtratoPix(conta?.id)

  if (!dados) {
    return (
      <Tela>
        {erro ? (
          <>
            <p role="alert" className="text-sm text-red-600">{erro}</p>
            <button type="button" className="mt-3 text-sm text-indigo-700" onClick={recarregar}>Tentar novamente</button>
          </>
        ) : <p role="status">Consultando sua sessão...</p>}
      </Tela>
    )
  }

  return (
    <Tela>
      <div className="w-full max-w-[400px] min-h-screen bg-white font-sans pb-24">

        <div className="flex items-center justify-between px-1 pt-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200">
              <Image src="/bye.png" alt="ByeBank" width={56} height={56} className="h-full w-full object-contain" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-slate-400">Olá,</span>
              <span className="text-xl font-bold text-slate-900">
                {dados.usuario.nomeCompleto}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/notificacao")}
            className="w-11 h-11 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>

        {conta ? <Card
          paddingClass="p-5"
          roundedClass="rounded-[32px]"
          borderClass="border border-[#263650]"
          bgClass="bg-[#161F31]"
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xl text-[#4F46E5]">SALDO DISPONÍVEL</span>
              <Eye className="w-7 h-7 text-slate-400" strokeWidth={2} />
            </div>

            <span className="text-5xl leading-none font-bold text-white mt-8">
              {formatarMoeda(conta.saldo)}
            </span>

            <div className="h-px bg-[#263650] my-5" />

            <div className="flex items-center justify-between">
              <span className="text-lg text-slate-400">
                Ag {conta.agencia} · Conta {conta.numero}
              </span>
            </div>
          </div>
        </Card> : (
          <Card>
            <p className="text-sm text-slate-700">Você ainda não possui conta bancária.</p>
            <Link href="/conta/criar-conta-bancaria" className="text-sm font-semibold text-indigo-700">Criar conta bancária</Link>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4 mt-5">
          <button
            type="button"
            onClick={() => router.push("/pix/transferir-pix")}
            disabled={!dados.contas.some((item) => item.status === "ATIVA")}
            className="h-[132px] rounded-[26px] bg-[#4F46E5] hover:bg-[#4338CA] p-5 flex flex-col items-start justify-between disabled:opacity-60"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowUp className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Enviar PIX</span>
          </button>

          <button
            type="button"
            disabled
            title="Recebimento externo disponível apenas para simulação na API"
            className="h-[132px] rounded-[26px] bg-[#4F46E5] p-5 flex flex-col items-start justify-between opacity-60"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <ArrowDown className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Receber PIX</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/pix/minhas-chaves-pix")}
            className="h-[132px] rounded-[26px] bg-[#4F46E5] hover:bg-[#4338CA] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px]  bg-[#0B3A3B] flex items-center justify-center">
              <KeyRound className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Minhas Chaves</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/conta/minhas-contas-bancarias")}
            className="h-[132px] rounded-[26px] bg-[#4F46E5] hover:bg-[#4338CA] p-5 flex flex-col items-start justify-between"
          >
            <div className="w-14 h-14 rounded-[17px] bg-[#0B3A3B] flex items-center justify-center">
              <CreditCard className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Minhas Contas</span>
          </button>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Últimas transações
            </h2>
            {conta && (
              <Link href={`/conta/historico-transacoes?contaId=${encodeURIComponent(conta.id)}`} className="text-lg font-bold text-[#4F46E5]">
                Ver tudo
              </Link>
            )}
          </div>

          {!conta && <p className="text-sm text-slate-600">O extrato estará disponível após criar uma conta.</p>}
          {conta && !extrato && <p role="status" className="text-sm text-slate-600">Carregando extrato...</p>}
          {extrato?.erro && <p role="alert" className="text-sm text-red-600">{extrato.erro}</p>}
          {extrato && !extrato.erro && extrato.itens.length === 0 && (
            <p className="text-sm text-slate-600">Nenhuma transação recente.</p>
          )}
          {extrato?.itens.slice(0, 5).map((item) => {
            const recebido = item.contaDestinoId === conta?.id
            return (
              <Link key={item.id} href={linkDetalhesPix(item.id, conta?.id)} className="flex items-center gap-4 border-b border-slate-200 py-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${recebido ? "bg-[#07352E]" : "bg-[#301822]"}`}>
                  {recebido
                    ? <ArrowDownLeft className="h-6 w-6 text-[#00E889]" />
                    : <ArrowUpRight className="h-6 w-6 text-[#FF5B65]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">{recebido ? "PIX recebido" : "PIX enviado"}</span>
                  <span className="text-sm text-slate-500">{formatarDataPix(item.realizadaEm)}</span>
                </div>
                <span className="font-semibold">{formatarMoeda(recebido ? item.valor : -item.valor)}</span>
              </Link>
            )
          })}
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
              <Wallet className="w-6 h-6 " strokeWidth={2.5} />
              <span className="text-xs">Contas</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/pix/transferir-pix")}
              disabled={!dados.contas.some((item) => item.status === "ATIVA")}
              className="flex flex-col items-center gap-1.5 text-slate-400 disabled:opacity-60"
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
