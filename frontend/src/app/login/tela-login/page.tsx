"use client"
import Card from '../../../components/Card'
import Tela from '../../../components/Tela'
import SmartphoneHeader from '../../../components/SmartphoneHeader'
import Input from '../../../components/Input'
import BotaoGrande from '../../../components/BotaoGrande'
import { Icon } from 'lucide-react'
import { User, Lock, Mail } from 'lucide-react'

export default ()=>{
    return (
        <Tela>
            <img src={"/bye.png"} className="w-60 h-10 object-contain mx-auto flex items-center justify-center mb-6"/>
            <div className="flex-col gap-2 w-28 h-28 bg-gray-200 flex items-center justify-center rounded-full mx-auto my-4 mb-6">
                 <User className="w-20 h-20 stroke-[1.8]" />
            </div>
            <SmartphoneHeader title="Bem-vindo de volta" backToUrl=""/>
            <div className="text-center text-sm text-gray-500 font-normal leading-relaxed max-w-xs mx-auto -mt-3">
                Acesse sua conta para gerenciar seus saldos
            </div>
            <Card>
                <Input 
                label="E-mail" 
                placeholder="Digite seu e-mail" 
                icon={<Mail className="w-5 h-5 stroke-[1.8]" />} 
                type="email"
                />
                <Input 
                    label="Senha"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    type="password"
                />
            </Card>
            <BotaoGrande 
                text="Entrar" 
                bgClass="bg-[#4F46E5] hover:bg-[#4338CA]" 
                textClass="text-white font-semibold"       
                widthClass="w-full"                        
            />
        </Tela>
    )
}