import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import Tela from "../../../components/Tela";

export default function Login() {
  return (
    <Tela>
      <div className="flex min-h-screen w-full flex-1 flex-col px-6 py-10">
        <Image src="/bye.png" alt="ByeBank" width={240} height={40} className="mx-auto h-10 w-60 object-contain" />
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao ByeBank</h1>
          <p className="text-sm text-slate-600">O login por e-mail e senha ainda está indisponível. O acesso atual começa pelo cadastro neste navegador.</p>
          <div className="mt-6 grid h-28 w-28 place-items-center rounded-full bg-slate-200" aria-hidden="true">
            <User className="h-20 w-20 text-slate-500" />
          </div>
        </div>
        <Link href="/login/cadastrar-usuario"
          className="mt-10 rounded-xl bg-[#4F46E5] py-4 text-center text-sm font-semibold text-white hover:bg-[#4338CA]">
          Criar conta
        </Link>
      </div>
    </Tela>
  );
}
