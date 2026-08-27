"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { User, Mail, Phone, CreditCard, Camera } from 'lucide-react'
import { useState, useRef } from 'react'

export default () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
    }
  }

  return (
    <Tela>
      <SmartphoneHeader title="Perfil" backToUrl="tela/inicial" />

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
          placeholder="Nome (banco de dados)" 
          icon={<User className="w-5 h-5 stroke-[1.8]" />} 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          label="E-mail" 
          placeholder="Email (banco de dados)" 
          icon={<Mail className="w-5 h-5 stroke-[1.8]" />} 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          label="Telefone"
          placeholder="Numero (banco de dados)"
          icon={<Phone className="w-5 h-5" />}
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Input 
          label="CPF" 
          placeholder="Cpf (banco de dados)" 
          icon={<CreditCard className="w-5 h-5 stroke-[1.8]" />} 
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
      </Card>

      <BotaoGrande 
        text="Salvar alterações" 
        bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" 
        textClass="text-white font-semibold"       
        widthClass="w-full"                         
      />
    </Tela>
  )
}