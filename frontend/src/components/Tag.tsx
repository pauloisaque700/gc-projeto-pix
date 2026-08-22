interface TagProps {
  label: string;
  variant?: 'blue' | 'green';
}

export default function Tag({ label, variant = 'blue' }: TagProps) {
  const variantClasses = variant === 'green'
    ? 'bg-[#E6FDF9] text-[#0D9488]' // Verde menta do Passo 2
    : 'bg-[#EEF2FF] text-[#4F46E5]'; // Roxo/Azul do Passo 1

  return (
    <div>
      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider ${variantClasses}`}>
        {label}
      </span>
    </div>
  );
}
