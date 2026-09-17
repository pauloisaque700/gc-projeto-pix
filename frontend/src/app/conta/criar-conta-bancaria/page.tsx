"use client";

import React, { useState } from "react";

type TipoConta = "corrente" | "poupanca";

interface CriarContaBancariaProps {
  onVoltar?: () => void;
  onCriarConta?: (dados: {
    tipoConta: TipoConta;
    agencia: string;
    conta: string;
  }) => void;
}

export default function CriarContaBancaria({
  onVoltar,
  onCriarConta,
}: CriarContaBancariaProps) {
  const [tipoConta, setTipoConta] = useState<TipoConta>("corrente");
  const [agencia, setAgencia] = useState<string>("");
  const [conta, setConta] = useState<string>("");

  const handleAgenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mantém apenas dígitos, útil para número de agência
    const valor = e.target.value.replace(/\D/g, "");
    setAgencia(valor);
  };

  const handleContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite dígitos e o hífen do dígito verificador (ex: 12345-6)
    const valor = e.target.value.replace(/[^0-9-]/g, "");
    setConta(valor);
  };

  const handleSubmit = () => {
    onCriarConta?.({ tipoConta, agencia, conta });
  };

  return (
    <div style={styles.tela}>
      <div style={styles.container}>
        {/* Cabeçalho */}
        <header style={styles.header}>
          <button
            type="button"
            onClick={onVoltar}
            style={styles.botaoVoltar}
            aria-label="Voltar"
          >
            ←
          </button>
          <h1 style={styles.tituloHeader}>Criar Conta Bancária</h1>
        </header>

        {/* Introdução */}
        <section style={styles.introducao}>
          <h2 style={styles.tituloSecao}>Nova Conta Bancária</h2>
          <p style={styles.subtitulo}>
            Adicione os detalhes da sua conta corrente ou poupança para
            integrar seu saldo à plataforma ByeBank.
          </p>
        </section>

        {/* Tipo de conta */}
        <section style={styles.campo}>
          <label style={styles.rotulo}>Tipo de conta</label>
          <div style={styles.grupoTipoConta}>
            <button
              type="button"
              onClick={() => setTipoConta("corrente")}
              style={{
                ...styles.botaoTipo,
                ...(tipoConta === "corrente" ? styles.botaoTipoAtivo : {}),
              }}
            >
              <span
                style={{
                  ...styles.radioIcone,
                  ...(tipoConta === "corrente" ? styles.radioIconeAtivo : {}),
                }}
              />
              <span
                style={{
                  ...styles.textoBotaoTipo,
                  ...(tipoConta === "corrente"
                    ? styles.textoBotaoTipoAtivo
                    : {}),
                }}
              >
                Corrente
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTipoConta("poupanca")}
              style={{
                ...styles.botaoTipo,
                ...(tipoConta === "poupanca" ? styles.botaoTipoAtivo : {}),
              }}
            >
              <span
                style={{
                  ...styles.radioIcone,
                  ...(tipoConta === "poupanca" ? styles.radioIconeAtivo : {}),
                }}
              />
              <span
                style={{
                  ...styles.textoBotaoTipo,
                  ...(tipoConta === "poupanca"
                    ? styles.textoBotaoTipoAtivo
                    : {}),
                }}
              >
                Poupança
              </span>
            </button>
          </div>
        </section>

        {/* Agência */}
        <section style={styles.campo}>
          <label style={styles.rotulo} htmlFor="agencia">
            Agência
          </label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcone}>🏦</span>
            <input
              id="agencia"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 0001"
              value={agencia}
              onChange={handleAgenciaChange}
              style={styles.input}
              maxLength={4}
            />
          </div>
        </section>

        {/* Conta */}
        <section style={styles.campo}>
          <label style={styles.rotulo} htmlFor="conta">
            Conta
          </label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcone}>💳</span>
            <input
              id="conta"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 12345-6"
              value={conta}
              onChange={handleContaChange}
              style={styles.input}
              maxLength={8}
            />
          </div>
        </section>

        {/* Botão de submissão */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!agencia || !conta}
          style={{
            ...styles.botaoCriar,
            ...(!agencia || !conta ? styles.botaoCriarDesabilitado : {}),
          }}
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tela: {
    minHeight: "100vh",
    backgroundColor: "#F5F6FA",
    display: "flex",
    justifyContent: "center",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 400,
    padding: "24px 20px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  botaoVoltar: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#1A1A2E",
    padding: 4,
    lineHeight: 1,
  },
  tituloHeader: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1A1A2E",
    margin: 0,
  },
  introducao: {
    marginBottom: 28,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1A1A2E",
    margin: "0 0 8px 0",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.5,
    margin: 0,
  },
  campo: {
    marginBottom: 20,
  },
  rotulo: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  },
  grupoTipoConta: {
    display: "flex",
    gap: 12,
  },
  botaoTipo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
  },
  botaoTipoAtivo: {
    borderColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
  },
  radioIcone: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid #D1D5DB",
    display: "inline-block",
    flexShrink: 0,
    boxSizing: "border-box",
  },
  radioIconeAtivo: {
    border: "5px solid #4F46E5",
  },
  textoBotaoTipo: {
    fontSize: 14,
    fontWeight: 500,
    color: "#1A1A2E",
  },
  textoBotaoTipoAtivo: {
    color: "#4F46E5",
    fontWeight: 600,
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  inputIcone: {
    fontSize: 16,
    flexShrink: 0,
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#1A1A2E",
    width: "100%",
    backgroundColor: "transparent",
  },
  botaoCriar: {
    width: "100%",
    padding: "16px",
    borderRadius: 14,
    border: "none",
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
    transition: "opacity 0.15s ease",
  },
  botaoCriarDesabilitado: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};