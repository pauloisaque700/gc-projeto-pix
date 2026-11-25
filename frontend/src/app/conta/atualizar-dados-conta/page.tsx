import { redirect } from 'next/navigation'

export default async function EditarConta({ searchParams }: PageProps<'/conta/atualizar-dados-conta'>) {
  const { contaId } = await searchParams
  const id = Array.isArray(contaId) ? contaId[0] : contaId
  const consulta = id === undefined ? '' : `?contaId=${encodeURIComponent(id)}`
  redirect(`/login/tela-perfil${consulta}`)
}
