"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { User, Mail, Phone, CreditCard, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { atualizarUsuario, buscarUsuario, ApiError } from '../../../lib/api'
import { obterUsuarioLogado } from '../../../lib/session'

export default function Perfil() {
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const idSalvo = obterUsuarioLogado()
    if (!idSalvo) {
      setCarregando(false)
      setErro('Nenhum usuário encontrado nesta sessão. Cadastre-se para continuar.')
      return
    }

    setUsuarioId(idSalvo)

    buscarUsuario(idSalvo)
      .then((usuario) => {
        setName(usuario.nomeCompleto)
        setEmail(usuario.email)
        setTelefone(usuario.telefone)
        setCpf(usuario.documento)
      })
      .catch(() => {
        setErro('Não foi possível carregar os dados do perfil.')
      })
      .finally(() => setCarregando(false))
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
    }
  }

  const handleSalvar = async () => {
    if (!usuarioId) return

    setErro(null)
    setSucesso(false)

    if (!name || !email || !telefone) {
      setErro('Preencha nome, e-mail e telefone antes de salvar.')
      return
    }

    setSalvando(true)
    try {
      const atualizado = await atualizarUsuario(usuarioId, {
        nomeCompleto: name,
        email,
        telefone,
      })
      setName(atualizado.nomeCompleto)
      setEmail(atualizado.email)
      setTelefone(atualizado.telefone)
      setSucesso(true)
    } catch (erroCapturado) {
      if (erroCapturado instanceof ApiError) {
        setErro(erroCapturado.message)
      } else if (erroCapturado instanceof Error) {
        setErro(erroCapturado.message)
      } else {
        setErro('Não foi possível salvar as alterações. Tente novamente.')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Tela>
      <SmartphoneHeader title="Perfil" backToUrl="/tela-principal" />

      <div className="relative w-28 h-28 mx-auto my-4 mb-6">
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-sm">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Foto de Perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-20 h-20 stroke-[1.8] text-gray-500" />
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Alterar foto de perfil"
          className="absolute bottom-0 right-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white p-2 rounded-full shadow-md transition-colors cursor-pointer flex items-center justify-center border-2 border-white"
        >
          <Camera className="w-4 h-4" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <Card>
        <Input
          label="Nome completo"
          placeholder="Nome completo"
          icon={<User className="w-5 h-5 stroke-[1.8]" />}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="E-mail"
          placeholder="E-mail"
          icon={<Mail className="w-5 h-5 stroke-[1.8]" />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Telefone"
          placeholder="Telefone"
          icon={<Phone className="w-5 h-5" />}
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <Input
            label="CPF"
            placeholder="CPF"
            icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />}
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <span className="text-[11px] text-slate-400">
            O CPF é o documento de identificação da conta e não pode ser alterado.
          </span>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-red-600 leading-relaxed">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-sm text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-emerald-600 leading-relaxed">Dados atualizados com sucesso.</p>
          </div>
        )}
      </Card>

      <BotaoGrande
        text="Salvar alterações"
        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]"
        textClass="text-white font-semibold"
        widthClass="w-full"
        isLoading={carregando || salvando}
        disabled={carregando || salvando || !usuarioId}
        onClick={handleSalvar}
      />
    </Tela>
  )
}