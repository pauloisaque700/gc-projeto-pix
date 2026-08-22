import { ArrowLeft } from "lucide-react";

export default function PixScreen() {
  return (
    // Simulador de tela de celular
    <div className="min-h-screen bg-slate-50 md:flex md:justify-center md:items-center">
      <main className="w-full min-h-screen bg-white px-4 py-6 flex flex-col font-sans md:max-w-[440px] md:min-h-[840px] md:shadow-lg md:rounded-2xl">
        
        {/* Cabeçalho da Tela, que tem a seta e o título */}
        <header className="flex items-center mb-6">
          {/* Botão com ícone de Seta para Voltar pra tela anterior*/}
          <button className="p-2 -ml-2 text-slate-800">
            <ArrowLeft className="w-6 h-6 stroke-2" />
          </button>
          //Título da tela
          <h1 className="text-xl font-bold text-slate-800 flex-1 text-center pr-6">
            Adicionar Chave PIX
          </h1>
        </header>

        {/* Conteúdo do Formulário */}
        <div className="flex-1">
          {/* Seus componentes de input e validação entram aqui */}
        </div>

      </main>
    </div>
  );
}
