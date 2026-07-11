import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Trophy,
  Skull,
  CalendarDays,
  Megaphone,
  ArrowRight,
  ShoppingCart
} from "lucide-react";

import { User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { useEffect } from "react";
import { supabase } from "../services/supabase";

export default function Home() {
  const navigate = useNavigate();

  const { user } = useAuth();

const [mensagem, setMensagem] = useState("");

useEffect(() => {
    carregarMensagens();
}, []);

async function carregarMensagens() {

    const { data } = await supabase
        .from("mural")
        .select("*")
        .order("created_at", { ascending: false });

    setMessages(data || []);

}

const [messages, setMessages] = useState([]);

async function publicarMensagem() {

    if (!mensagem.trim()) return;

    const { error } = await supabase
        .from("mural")
        .insert({
            autor: user?.email,
            mensagem: mensagem
        });

    if (error) {
        alert(error.message);
        return;
    }

    setMensagem("");

    carregarMensagens();

}

  const recados = [
    "🗑️ Esqueceram o lixo de novo...",
    "🚿 Por favor lavem o banheiro.",
    "🍕 Não esqueça a louça suja.",
    "🧽 A pia já está criando vida."
  ];

  const frase =
    recados[Math.floor(Math.random() * recados.length)];

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-10 text-white shadow-xl">
      
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10"/>

        <div className="relative">

          <div className="flex items-center gap-3 mb-3">

          </div>

          <h1 className="text-5xl font-black">
            🏠 APTO 404
          </h1>
          

          <p className="mt-4 text-lg text-blue-100 max-w-2xl">
            Bem-vindo ao sistema de Limpeza do apartamento.
            Aqui você acompanha tarefas, rankings,
            históricos e pedidos.
          </p>

        </div>

      </section>

      {/* FRASE */}

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">

        <Megaphone className="text-yellow-600"/>

        <div>

          <h2 className="font-bold text-gray-900">
            Recado do dia
          </h2>

          <p className="text-gray-700">
            {frase}
          </p>

        </div>

      </div>

      {/* MENU */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card
          title="Escala"
          text="Veja quem limpa o quê."
          icon={<ClipboardList />}
          color="from-blue-500 to-cyan-500"
          onClick={() => navigate("/tarefas")}
        />

        <Card
          title="Compras"
          text="Adicione algo na lista."
          icon={<ShoppingCart />}
          color="from-yellow-500 to-orange-500"
          onClick={() => navigate("/compras")}
        />


        <Card
          title="Vergonha"
          text="Os maiores porcos."
          icon={<Skull />}
          color="from-red-500 to-pink-600"
          onClick={() => navigate("/ranking-da-vergonha")}
        />

        <Card
          title="Histórico"
          text="Semanas anteriores."
          icon={<CalendarDays />}
          color="from-emerald-500 to-green-600"
          onClick={() => navigate("/historico")}
        />

      </div>

      {/* MURAL */}

      <section className="bg-white rounded-3xl shadow-sm border p-8">

    <div className="flex items-center justify-between mb-6">

        <div>

            <h2 className="text-2xl font-bold">
                📢 Mural do Apartamento
            </h2>

            <p className="text-gray-500">
                Recados, reclamações e avisos.
            </p>

        </div>

    </div>

    {user ? (
        <div className="mb-8">

            <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva um recado..."
                rows={4}
                className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    p-4
                    resize-none
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                "
            />

            <div className="flex justify-end mt-4">

                <Button onClick={publicarMensagem}>
                    Publicar
                </Button>

            </div>

        </div>

    ) : (
      <NavLink
  to="/admin"
  className="block mb-8 rounded-2xl bg-blue-50 border border-blue-100 p-5"
>
  <div>
    <p className="text-blue-700">
      🔒 Faça login para escrever no mural.
    </p>
  </div>
</NavLink>

    )}

    <div className="space-y-4">

    {messages.length === 0 ? (

        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">

            <h3 className="text-lg font-semibold text-gray-700">
                Nenhum recado ainda
            </h3>

            <p className="text-gray-500 mt-2">
                Seja o primeiro a escrever no mural da república! 🎉
            </p>

        </div>

    ) : (

        messages.map((msg) => (

            <div
                key={msg.id}
                className="border rounded-2xl p-5 hover:shadow-md transition"
            >

                <div className="flex justify-between">

                    <h3 className="font-bold">
                        {msg.autor}
                    </h3>

                    <span className="text-xs text-gray-400">
                        agora
                    </span>

                </div>

                <p className="mt-3 whitespace-pre-wrap">
                    {msg.mensagem}
                </p>

            </div>

        ))

    )}

</div>

</section>

    </div>
  );
}

function Card({
  title,
  text,
  icon,
  color,
  onClick
}: any) {

  return (

    <button
      onClick={onClick}
      className="
      text-left
      rounded-3xl
      overflow-hidden
      shadow-sm
      hover:shadow-xl
      transition
      bg-white
      "
    >

      <div className={`bg-gradient-to-r ${color} p-5 text-white`}>

        {icon}

      </div>

      <div className="p-5">

        <h3 className="font-bold text-lg">
          {title}
        </h3>

        <p className="text-gray-500 mt-2">
          {text}
        </p>

        <div className="flex items-center gap-2 mt-4 text-blue-600 font-semibold">

          Abrir

          <ArrowRight size={16}/>

        </div>

      </div>

    </button>

  );

}

function Message({
  nome,
  texto
}: any) {

  return (

    <div className="border rounded-2xl p-4 hover:bg-gray-50 transition">

      <div className="font-bold">
        {nome}
      </div>

      <div className="text-gray-600 mt-1">
        {texto}
      </div>

    </div>

  );

}