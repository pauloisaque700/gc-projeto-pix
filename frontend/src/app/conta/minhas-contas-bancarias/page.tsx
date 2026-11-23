"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Tela from "../../../components/Tela"
import SmartphoneHeader from "../../../components/SmartphoneHeader"
import Card from "../../../components/Card"
import BotaoGrande from "../../../components/BotaoGrande"
import { Plus, AlertCircle, Trash2 } from "lucide-react"
import { removerConta } from "../../../lib/api"
import { obterSessaoLocal, type SessaoLocal } from "../../../lib/session"
import { useDadosDaSessao } from "../../../lib/use-dados-da-sessao"

export default function MinhasContasBancarias() {
  const router = useRouter()
  const { sessao, dados, erro: erroSessao, recarregar } = useDadosDaSessao()
  const [remocao, setRemocao] = useState<{ sessao: SessaoLocal; contaId: string | null; erro: string | null } | null>(null)
  const remocaoAtual = remocao?.sessao === sessao ? remocao : null
  const removendoId = remocaoAtual?.contaId ?? null
  const erro = erroSessao ?? remocaoAtual?.erro

  const handleRemoverConta = async (id: string) => {
    if (!dados?.contas.some((conta) => conta.id === id) || removendoId || obterSessaoLocal() !== sessao) return
    setRemocao({ sessao, contaId: id, erro: null })
    try {
      await removerConta(id)
      if (obterSessaoLocal() === sessao) {
        setRemocao(null)
        recarregar()
      }
    } catch (error) {
      if (obterSessaoLocal() === sessao) {
        const mensagem = error instanceof Error ? error.message : "Não foi possível remover a conta selecionada."
        setRemocao({ sessao, contaId: null, erro: mensagem })
      }
    }
  }

  const formatarSaldo = (saldo: number) =>
    saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Tela>
      <SmartphoneHeader title="Minhas Contas" backToUrl="/tela-principal" />

      <div className="flex flex-col gap-6 px-1 py-2 font-sans w-full max-w-[400px]">
        {/* Cabeçalho de Boas-vindas */}
        <div className="flex flex-col gap-1.5">
          {dados && <h2 className="text-lg font-bold text-slate-800">Olá, {dados.usuario.nomeCompleto}</h2>}
          <p className="text-xs text-slate-400 leading-relaxed">
            Gerencie e movimente seus saldos ByeBank em tempo real de forma segura.
          </p>
        </div>

        {/* Mensagem de Erro Global */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
          </div>
        )}

        {erroSessao && <BotaoGrande text="Tentar novamente" onClick={recarregar} />}

        {!dados && !erroSessao ? (
          <div role="status" aria-label="Carregando suas contas" className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          </div>
        ) : (
          /* Lista de Contas da API */
          <div className="flex flex-col gap-4">
            {dados?.contas.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                Nenhuma conta cadastrada ainda.
              </p>
            )}

            {dados?.contas.map((conta) => (
              <Card
                key={conta.id}
                paddingClass="p-5"
                roundedClass="rounded-3xl"
                borderClass="border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-white"
              >
                <div className="flex flex-col gap-4 w-full">
                  {/* Topo do Card: Tag e Banco */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        conta.tipoConta === "CORRENTE"
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : 'bg-[#ECFDF5] text-[#059669]'
                      }`}
                    >
                      {conta.tipoConta === "CORRENTE" ? 'Conta Corrente' : 'Conta Poupança'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></span>
                      ByeBank
                    </span>
                  </div>

                  {/* Agência, Conta e Saldo + Botão de Deletar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-6 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      <span>
                        Agência{' '}
                        <strong className="text-slate-700 font-semibold">
                          {conta.agencia}
                        </strong>
                      </span>
                      <span>
                        Conta{' '}
                        <strong className="text-slate-700 font-semibold">
                          {conta.numero}
                        </strong>
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          Saldo disponível
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          R$ {formatarSaldo(conta.saldo)}
                        </h3>
                      </div>

                      {/* Botão para Deletar a Conta */}
                      <button
                        type="button"
                        onClick={() => handleRemoverConta(conta.id)}
                        disabled={removendoId !== null}
                        aria-label="Remover conta"
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Remover conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Botões Internos do Card */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <BotaoGrande
                      text="Acessar conta"
                      bgClass="bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                      textClass="text-[#4F46E5] font-semibold text-sm"
                      widthClass="w-full"
                      onClick={() => router.push(`/conta/historico-transacoes?contaId=${encodeURIComponent(conta.id)}`)}
                    />
                    <BotaoGrande
                      text="Editar Conta"
                      bgClass="bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                      textClass="text-[#4F46E5] font-semibold text-sm"
                      widthClass="w-full"
                      onClick={() => router.push(`/conta/editar/${conta.id}`)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Botões Inferiores com Borda Tracejada mantidos exatamente como você configurou */}
        <div className="flex flex-col gap-3 mt-2">
          <BotaoGrande
            text="Criar nova conta"
            bgClass="bg-transparent hover:bg-slate-50/50"
            borderClass="border-2 border-dashed border-[#4F46E5]/50"
            textClass="text-[#4F46E5] font-semibold text-sm"
            widthClass="w-full"
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            onClick={() => router.push('/conta/criar-conta-bancaria')}
          />

          <BotaoGrande
            text="Gerar Relatório de Transações do Usuário"
            bgClass="bg-transparent hover:bg-slate-50/50"
            borderClass="border-2 border-dashed border-[#4F46E5]/50"
            textClass="text-[#4F46E5] font-semibold text-sm text-center"
            widthClass="w-full"
            onClick={() => router.push('/conta/relatorio-transacoes-usuario')}
          />

          <BotaoGrande
            text="Consultar histórico de Logins"
            bgClass="bg-transparent hover:bg-slate-50/50"
            borderClass="border-2 border-dashed border-[#4F46E5]/50"
            textClass="text-[#4F46E5] font-semibold text-sm text-center"
            widthClass="w-full"
            onClick={() => router.push('/login/historico-de-logins')}
          />
        </div>
      </div>
    </Tela>
  )
}
