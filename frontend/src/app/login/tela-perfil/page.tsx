"use client"

import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { User, Mail, Phone, CreditCard, Landmark, Hash, Wallet, AlertCircle, CheckCircle2, Camera } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarConta, atualizarUsuario, buscarUsuario, definirLimiteDiario, definirNotificacao, listarContasDoUsuario, type Conta } from '../../../lib/api'
import { obterUsuarioLogado } from '../../../lib/session'

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function CampoLeitura({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
      {label}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input readOnly value={value} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-600" />
      </div>
    </label>
  )
}

export default function EditarConta() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('CPF')
  const [conta, setConta] = useState<Conta | null>(null)
  const [agencia, setAgencia] = useState('')
  const [numeroConta, setNumeroConta] = useState('')
  const [limite, setLimite] = useState('')
  const [notificacao, setNotificacao] = useState<Conta['notificacao']>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const idSalvo = obterUsuarioLogado()
        if (!idSalvo) throw new Error('Entre na sua conta para editar o perfil.')
        const [usuario, contas] = await Promise.all([
          buscarUsuario(idSalvo), listarContasDoUsuario(idSalvo),
        ])
        if (!ativo) return
        setUsuarioId(usuario.id)
        setName(usuario.nomeCompleto)
        setEmail(usuario.email)
        setTelefone(usuario.telefone)
        setCpf(usuario.documento)
        setTipoDocumento(usuario.tipoDocumento)
        const primeiraConta = contas[0] ?? null
        setConta(primeiraConta)
        if (primeiraConta) {
          setAgencia(primeiraConta.agencia)
          setNumeroConta(primeiraConta.numero)
          setLimite(formatarMoeda(primeiraConta.limiteDiario))
          setNotificacao(primeiraConta.notificacao)
        }
      } catch (error) {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar o perfil.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    void carregar()
    return () => { ativo = false }
  }, [])

  const handleLimiteChange = (valor: string) => {
    const digitos = valor.replace(/\D/g, '')
    setLimite(digitos ? formatarMoeda(Number(digitos) / 100) : '')
  }

  const handleSalvar = async () => {
    if (!usuarioId || carregando || salvando) return
    setErro('')
    setSucesso('')
    const limiteNumerico = Number(limite.replace(/\D/g, '')) / 100
    if (conta && (!limite || !Number.isFinite(limiteNumerico))) {
      setErro('Informe um limite diário válido.')
      return
    }
    setSalvando(true)
    let algumaAlteracaoSalva = false
    try {
      const usuario = await atualizarUsuario(usuarioId, { nomeCompleto: name, email, telefone })
      algumaAlteracaoSalva = true
      setName(usuario.nomeCompleto)
      setEmail(usuario.email)
      setTelefone(usuario.telefone)
      if (conta) {
        const contaId = conta.id
        await atualizarConta(contaId, { agencia, numero: numeroConta })
        await definirLimiteDiario(contaId, limiteNumerico)
        const atualizada = await definirNotificacao(contaId, notificacao)
        setConta(atualizada)
        setAgencia(atualizada.agencia)
        setNumeroConta(atualizada.numero)
        setLimite(formatarMoeda(atualizada.limiteDiario))
        setNotificacao(atualizada.notificacao)
      }
      setSucesso('Alterações salvas com sucesso.')
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível salvar as alterações.'
      setErro(algumaAlteracaoSalva ? `Parte das alterações foi salva. ${mensagem} Tente salvar novamente.` : mensagem)
    } finally {
      setSalvando(false)
    }
  }

  const bloqueado = carregando || salvando || !usuarioId
  const icone = 'w-5 h-5 stroke-[1.8]'

  return (
    <Tela>
      <SmartphoneHeader title="Editar conta" backToUrl="/tela-principal" />
      <div className="flex flex-col gap-5">
        <div className="relative w-20 h-20 mx-auto mt-4 rounded-full bg-indigo-50 flex items-center justify-center" aria-hidden="true">
          <User className="w-10 h-10 text-indigo-500" />
          <Camera className="absolute bottom-0 right-0 w-6 h-6 p-1 rounded-full bg-white text-slate-400" />
        </div>
        {carregando && <p role="status" className="text-sm text-slate-500">Carregando dados...</p>}
        {erro && <p role="alert" className="flex items-start gap-2 text-sm text-red-600"><AlertCircle className="w-5 h-5 shrink-0" />{erro}</p>}
        {sucesso && <p role="status" className="flex items-start gap-2 text-sm text-emerald-600"><CheckCircle2 className="w-5 h-5 shrink-0" />{sucesso}</p>}

        <fieldset disabled={bloqueado} className="min-w-0 flex flex-col gap-5" onChange={() => setSucesso('')}>
          <Card>
            <h2 className="text-lg font-semibold text-slate-800">Dados pessoais</h2>
            <Input label="Nome completo" placeholder="Nome completo" icon={<User className={icone} />} value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-mail" placeholder="seu@email.com" type="email" icon={<Mail className={icone} />} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Telefone" placeholder="(00) 00000-0000" type="tel" icon={<Phone className={icone} />} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <CampoLeitura label={tipoDocumento} value={cpf} icon={<CreditCard className={icone} />} />
            <p className="text-xs text-slate-500">{tipoDocumento} não pode ser alterado.</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-800">Dados da conta</h2>
            {conta ? <>
              <Input label="Agência" placeholder="Agência" icon={<Landmark className={icone} />} value={agencia} onChange={(e) => setAgencia(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              <Input label="Número da conta" placeholder="Número da conta" icon={<Hash className={icone} />} value={numeroConta} onChange={(e) => setNumeroConta(e.target.value.replace(/\D/g, '').slice(0, 20))} />
              <CampoLeitura label="Titular" value={conta.nomeTitular} icon={<User className={icone} />} />
              <CampoLeitura label="Tipo de conta" value={conta.tipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança'} icon={<Landmark className={icone} />} />
              <Input label="Limite diário" placeholder="R$ 0,00" icon={<Wallet className={icone} />} value={limite} onChange={(e) => handleLimiteChange(e.target.value)} />
              <fieldset className="flex gap-3">
                <legend className="text-sm font-medium text-slate-600 mb-2">Habilitar notificações por:</legend>
                {(['EMAIL', 'SMS'] as const).map((canal) => (
                  <label key={canal} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer ${notificacao === canal ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-semibold' : 'border-gray-200 text-slate-700'}`}>
                    <input type="radio" name="notificacao" value={canal} checked={notificacao === canal} onChange={() => setNotificacao(canal)} className="accent-[#4F46E5]" />
                    {canal === 'EMAIL' ? 'E-mail' : 'SMS'}
                  </label>
                ))}
              </fieldset>
              <CampoLeitura label="Status" value={conta.status === 'ATIVA' ? 'Ativa' : 'Bloqueada'} icon={conta.status === 'ATIVA' ? <CheckCircle2 className={icone} /> : <AlertCircle className={icone} />} />
            </> : <p className="text-sm text-slate-500">{carregando ? 'Carregando conta...' : usuarioId ? 'Você ainda não possui conta bancária.' : 'Dados da conta indisponíveis.'}</p>}
          </Card>
        </fieldset>

        <BotaoGrande text="Salvar alterações" bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" textClass="text-white font-semibold" widthClass="w-full" isLoading={salvando} disabled={bloqueado} onClick={handleSalvar} />
        <BotaoGrande text="Remover conta" bgClass="bg-red-500 hover:bg-red-600" textClass="text-white font-semibold" widthClass="w-full" disabled={bloqueado || !conta} onClick={() => {
          if (conta) router.push(`/login/tela-remover-conta?contaId=${encodeURIComponent(conta.id)}`)
        }} />
      </div>
    </Tela>
  )
}
