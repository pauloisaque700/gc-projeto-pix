"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, CreditCard, ChevronDown, AlertCircle, Shield } from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

interface ContaBancaria {
  id: string;
  label: string;
}

const CONTAS_DISPONIVEIS: ContaBancaria[] = [
  { id: "cc-1234", label: "Conta Corrente ****1234" },
  { id: "cp-5678", label: "Conta Poupança ****5678" },
];

const DADOS_INICIAIS = {
  chave: "rafaeloliveira@aaaaa.com",
  contaId: "cc-1234",
};

function formatoValido(chave: string): boolean {
  const valor = chave.trim();
  const ehEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  const ehCpfOuCnpj = /^\d{11}$|^\d{14}$/.test(valor.replace(/\D/g, ""));
  const ehTelefone = /^\+?\d{10,13}$/.test(valor.replace(/[\s()-]/g, ""));
  const ehChaveAleatoria =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      valor
    );
  return ehEmail || ehCpfOuCnpj || ehTelefone || ehChaveAleatoria;
}

const CHAVES_INEXISTENTES_SIMULADAS = ["rafaeloliveira@aaaaa.com"];

async function verificarChaveExiste(chave: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // latência simulada
  return !CHAVES_INEXISTENTES_SIMULADAS.includes(chave.trim().toLowerCase());
}

type StatusValidacao = "ocioso" | "verificando" | "valida" | "invalida";

export default function MinhasChavesPixPage() {
  const [chave, setChave] = useState(DADOS_INICIAIS.chave);
  const [contaId, setContaId] = useState(DADOS_INICIAIS.contaId);
  const [status, setStatus] = useState<StatusValidacao>("ocioso");
  const [salvando, setSalvando] = useState(false);

  const idVerificacaoAtual = useRef(0);

  useEffect(() => {
    if (!chave.trim()) {
      setStatus("ocioso");
      return;
    }

    if (!formatoValido(chave)) {
      setStatus("invalida");
      return;
    }

    const idDestaVerificacao = ++idVerificacaoAtual.current;
    setStatus("verificando");

    const timeout = setTimeout(async () => {
      const existe = await verificarChaveExiste(chave);

      if (idDestaVerificacao === idVerificacaoAtual.current) {
        setStatus(existe ? "valida" : "invalida");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [chave]);

  const houveAlteracao =
    chave !== DADOS_INICIAIS.chave || contaId !== DADOS_INICIAIS.contaId;

  const podeSalvar = houveAlteracao && status === "valida" && !salvando;

  const handleDescartar = () => {
    setChave(DADOS_INICIAIS.chave);
    setContaId(DADOS_INICIAIS.contaId);
  };

  const handleSalvar = async () => {
    if (!podeSalvar) return;

    setSalvando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("Alterações salvas:", { chave, contaId });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela>
      <SmartphoneHeader title="Minhas Chaves PIX" backToUrl="/tela-principal" />

      <div className="flex flex-col gap-4 font-sans">
        {/* Card principal */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {/* Chave */}
          <div className="flex flex-col gap-2">
            <label htmlFor="chave" className="text-xs font-bold text-slate-500">
              Chave
            </label>
            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 ${
                status === "invalida"
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            >
              <Mail className="w-[18px] h-[18px] text-slate-400 stroke-[1.8] shrink-0" />
              <input
                id="chave"
                type="text"
                placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
            </div>

            {status === "invalida" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-500 stroke-[2] shrink-0" />
                <span className="text-xs font-medium text-red-600">
                  Chave pix inválida
                </span>
              </div>
            )}

            {status === "verificando" && (
              <span className="text-xs text-slate-400 px-1">
                Verificando chave…
              </span>
            )}
          </div>

          {/* Conta para recebimento */}
          <div className="flex flex-col gap-2">
            <label htmlFor="conta" className="text-xs font-bold text-slate-500">
              Conta para recebimento
            </label>
            <div className="relative flex items-center gap-2.5 rounded-2xl border border-slate-200 px-4 py-3.5">
              <CreditCard className="w-[18px] h-[18px] text-slate-400 stroke-[1.8] shrink-0" />
              <select
                id="conta"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                className="w-full appearance-none text-sm font-medium text-slate-800 outline-none bg-transparent pr-6"
              >
                {CONTAS_DISPONIVEIS.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 stroke-[2] absolute right-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Aviso de segurança */}
        <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-2xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#6D28D9] shrink-0 stroke-[1.8]" />
          <p className="text-[11px] text-[#6D28D9] font-medium leading-relaxed">
            Suas chaves PIX estão criptografadas e protegidas pelo Banco Central.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            type="button"
            onClick={handleSalvar}
            disabled={!podeSalvar}
            className="w-full rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:hover:bg-[#4F46E5] disabled:cursor-not-allowed text-white text-sm font-semibold py-4 transition-colors"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            onClick={handleDescartar}
            disabled={!houveAlteracao || salvando}
            className="w-full rounded-2xl border border-[#4F46E5] text-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F3FF] text-sm font-semibold py-4 transition-colors"
          >
            Descartar alterações
          </button>
        </div>
      </div>
    </Tela>
  );
}