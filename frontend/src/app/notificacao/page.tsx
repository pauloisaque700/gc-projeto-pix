"use client"

import Tela from "../../components/Tela"
import SmartphoneHeader from "../../components/SmartphoneHeader"
import { Bell } from "lucide-react"

export default function Notificacoes() {
  const notificacoes = [
    {
      id: 1,
      titulo: "Notificação Recebida",
      texto: "Texto da notificação recebida",
      tempo: "Ontem",
    },
  ]

  return (
    <Tela>
      <SmartphoneHeader
        title="Tela de notificações"
        backToUrl="/login/tela-perfil"
      />

      <div className="w-full max-w-[400px] px-1 py-2 font-sans">
        <div className="flex flex-col">
          {notificacoes.map((notificacao) => (
            <div key={notificacao.id}>
              <div className="flex items-center gap-5 py-5">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Bell className="w-10 h-10 text-slate-600 stroke-[1.8]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-800">
                        {notificacao.titulo}
                      </span>

                      <span className="text-sm text-slate-500 mt-1">
                        {notificacao.texto}
                      </span>
                    </div>

                    <span className="text-sm text-slate-500 shrink-0 pt-1">
                      {notificacao.tempo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </Tela>
  )
}