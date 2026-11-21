"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  CreditCard,
  ChevronDown,
  AlertCircle,
  Shield,
  UserRound,
  Building2,
  Phone,
} from "lucide-react";
import Tela from "../../../components/Tela";
import SmartphoneHeader from "../../../components/SmartphoneHeader";

interface ContaBancaria {
  id: string;
  label: string;
}

const CONTAS_DISPONIVEIS: ContaBancaria[] = [
  { id: "cc-1234", label: "Conta Corrente ****1234" },
];

const DADOS_INICIAIS = {
  chave: "rafaeloliveira@aaaaa.com",
  contaId: "cc-1234",
};

type TipoChave = "cpf" | "cnpj" | "email" | "telefone" | null;

function identificarTipoChave(chave: string): TipoChave {
  const valor = chave.trim();

  if (!valor) {
    return null;
  }

  // E-mail
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return "email";
  }

  // Telefone com + ou formatação
  if (
    valor.startsWith("+") ||
    /[\(\)]/.test(valor) ||
    /^\d{2}\s?\d{4,5}-\d{4}$/.test(valor)
  ) {
    const numeros = valor.replace(/\D/g, "");

    if (numeros.length >= 10 && numeros.length <= 13) {
      return "telefone";
    }
  }

  // Remove caracteres para CPF/CNPJ
  const numeros = valor.replace(/\D/g, "");

  // CNPJ
  if (numeros.length === 14) {
    return "cnpj";
  }

  // CPF
  if (numeros.length === 11) {
    return "cpf";
  }

  // Telefone sem formatação
  if (numeros.length === 10 || numeros.length === 12 || numeros.length === 13) {
    return "telefone";
  }

  return null;
}

function formatoValido(chave: string): boolean {
  const valor = chave.trim();

  // E-mail
  const ehEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  // CPF: exatamente 11 números
  const ehCpf = /^\d{11}$/.test(
    valor.replace(/\D/g, "")
  );

  // CNPJ: exatamente 14 números
  const ehCnpj = /^\d{14}$/.test(
    valor.replace(/\D/g, "")
  );

  // Telefone
  const numerosTelefone = valor.replace(/\D/g, "");

  const ehTelefone =
    (valor.startsWith("+") ||
      /[\(\)-]/.test(valor) ||
      numerosTelefone.length !== 11) &&
    numerosTelefone.length >= 10 &&
    numerosTelefone.length <= 13;

  return (
    ehEmail ||
    ehCpf ||
    ehCnpj ||
    ehTelefone
  );
}

const CHAVES_INEXISTENTES_SIMULADAS = [
  "rafaeloliveira@aaaaa.com",
];

async function verificarChaveExiste(
  chave: string
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return !CHAVES_INEXISTENTES_SIMULADAS.includes(
    chave.trim().toLowerCase()
  );
}

type StatusValidacao =
  | "ocioso"
  | "verificando"
  | "valida"
  | "invalida";

export default function MinhasChavesPixPage() {
  const [chave, setChave] = useState(DADOS_INICIAIS.chave);
  const [contaId, setContaId] = useState(DADOS_INICIAIS.contaId);
  const [resultadoAsync, setResultadoAsync] = useState<{
    chaveVerificada: string;
    status: "valida" | "invalida";
  } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const idVerificacaoAtual = useRef(0);

  const tipoChave = identificarTipoChave(chave);

  const chaveTrim = chave.trim();
  const ehFormatoValido = chaveTrim ? formatoValido(chave) : false;

  const status: StatusValidacao = !chaveTrim
    ? "ocioso"
    : !ehFormatoValido
    ? "invalida"
    : resultadoAsync?.chaveVerificada === chave
    ? resultadoAsync.status
    : "verificando";

  useEffect(() => {
    if (!chaveTrim || !ehFormatoValido) {
      return;
    }

    const idDestaVerificacao =
      ++idVerificacaoAtual.current;

    const timeout = setTimeout(async () => {
      const existe = await verificarChaveExiste(chave);

      if (
        idDestaVerificacao === idVerificacaoAtual.current
      ) {
        setResultadoAsync({
          chaveVerificada: chave,
          status: existe ? "valida" : "invalida",
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [chave, chaveTrim, ehFormatoValido]);

  const houveAlteracao =
    chave !== DADOS_INICIAIS.chave ||
    contaId !== DADOS_INICIAIS.contaId;

  const podeSalvar =
    houveAlteracao &&
    status === "valida" &&
    !salvando;

  const contaSelecionada =
    CONTAS_DISPONIVEIS.find(
      (conta) => conta.id === contaId
    ) ?? CONTAS_DISPONIVEIS[0];

  const handleSelecionarConta = (
    conta: ContaBancaria
  ) => {
    setContaId(conta.id);
    setIsOpen(false);
  };

  const handleDescartar = () => {
    setChave(DADOS_INICIAIS.chave);
    setContaId(DADOS_INICIAIS.contaId);
    setIsOpen(false);
  };

  const handleSalvar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      console.log("Alterações salvas:", {
        chave,
        contaId,
      });
    } finally {
      setSalvando(false);
    }
  };

  const renderIconeChave = () => {
    const className =
      "w-[18px] h-[18px] text-slate-400 stroke-[1.8] shrink-0";

    switch (tipoChave) {
      case "cpf":
        return <UserRound className={className} />;

      case "cnpj":
        return <Building2 className={className} />;

      case "telefone":
        return <Phone className={className} />;

      case "email":
        return <Mail className={className} />;

      default:
        return <Mail className={className} />;
    }
  };

  return (
    <Tela>
      <SmartphoneHeader
        title="Minhas Chaves PIX"
        backToUrl="/tela-principal"
      />

      <div className="flex flex-col gap-4 font-sans">
        {/* Card principal */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {/* Chave */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="chave"
              className="text-xs font-bold text-slate-500"
            >
              Chave
            </label>

            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 ${
                status === "invalida"
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            >
              {renderIconeChave()}

              <input
                id="chave"
                type="text"
                placeholder="CPF, CNPJ, e-mail ou telefone"
                value={chave}
                onChange={(e) =>
                  setChave(e.target.value)
                }
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
            <label className="text-xs font-bold text-slate-500">
              Conta para recebimento
            </label>

            <div className="relative w-full">
              {/* Botão do dropdown */}
              <button
                type="button"
                onClick={() =>
                  setIsOpen((prev) => !prev)
                }
                disabled={salvando}
                className={`w-full px-4 py-3.5 bg-white border rounded-2xl flex items-center justify-between text-sm font-medium text-slate-800 transition-all text-left focus:outline-none ${
                  isOpen
                    ? "border-[#4F46E5] ring-1 ring-[#4F46E5]"
                    : "border-slate-200 hover:border-slate-300"
                } ${
                  salvando
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-[18px] h-[18px] text-slate-400 stroke-[1.8] shrink-0" />

                  <span className="truncate">
                    {contaSelecionada.label}
                  </span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-slate-500 stroke-2 transition-transform duration-200 shrink-0 ml-2 ${
                    isOpen
                      ? "rotate-180 text-[#4F46E5]"
                      : ""
                  }`}
                />
              </button>

              {/* Menu de opções */}
              {isOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  {CONTAS_DISPONIVEIS.map((conta) => {
                    const selecionada =
                      contaId === conta.id;

                    return (
                      <button
                        key={conta.id}
                        type="button"
                        onClick={() =>
                          handleSelecionarConta(conta)
                        }
                        className={`w-full px-4 py-3 text-sm text-left transition-colors flex items-center gap-3 ${
                          selecionada
                            ? "bg-slate-50 text-[#4F46E5] font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <CreditCard
                          className={`w-4 h-4 stroke-[1.8] ${
                            selecionada
                              ? "text-[#4F46E5]"
                              : "text-slate-400"
                          }`}
                        />

                        <span className="truncate">
                          {conta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
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
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
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
