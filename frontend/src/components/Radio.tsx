interface RadioProps {
  id: string;               // Identificador único da opção
  label: string;            // O texto que aparece ao lado do círculo
  isSelected: boolean;      // Indica se este botão está ativo
  onClick: () => void;      // Função disparada ao clicar no botão
}

export default function Radio({ id, label, isSelected, onClick }: RadioProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-left w-full
        ${isSelected 
          ? 'border-[#4F46E5] bg-white text-[#4F46E5] ring-1 ring-[#4F46E5]' 
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
    >
      {/* Círculo do Radio Button Customizado */}
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0
        ${isSelected ? 'border-[#4F46E5]' : 'border-slate-300'}`}
      >
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
        )}
      </div>
      <span>{label}</span>
    </button>
  );
}
