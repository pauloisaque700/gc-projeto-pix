import { redirect } from 'next/navigation'

export default async function RemoverConta({ searchParams }: PageProps<'/conta/remover-conta'>) {
  const { contaId } = await searchParams
  const id = Array.isArray(contaId) ? contaId[0] : contaId
  const consulta = new URLSearchParams({ origem: 'lista' })
  if (id !== undefined) consulta.set('contaId', id)
  redirect(`/login/tela-remover-conta?${consulta}`)
}
