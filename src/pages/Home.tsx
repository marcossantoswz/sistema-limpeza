import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Skull,
  CalendarDays,
  Megaphone,
  ArrowRight,
  ShoppingCart,
  Pin,
  Send,
  Lock
} from "lucide-react";

import { NavLink } from 'react-router-dom';

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { supabase } from "../services/supabase";

interface MuralMessage {
  id: string;
  autor: string;
  mensagem: string;
  created_at: string;
}

// Paleta do "quadro de avisos": papel kraft, tinta escura e três cores de fita.
const TAPE_COLORS = ["bg-[#F2A93B]", "bg-[#2F9C95]", "bg-[#D64550]"];

export default function Home() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [mensagem, setMensagem] = useState("");

  const [messages, setMessages] = useState<MuralMessage[]>([]);

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

      <section className="relative overflow-hidden rounded-[28px] bg-[#20242B] p-10 sm:p-12 text-[#F6F0E4] shadow-xl">

        {/* textura de pontos, tipo papelão */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px"
          }}
        />

        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#D64550]/25 blur-3xl" />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full bg-[#2F9C95]/25 blur-3xl" />

        <div className="relative">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#F2A93B]">
            <Pin size={12} /> Quadro de avisos oficial
          </div>

          <h1 className="mt-5 text-5xl sm:text-6xl font-black tracking-tight [font-family:'Space_Grotesk',_sans-serif]">
            🏠 Apto <span className="text-[#F2A93B]">404</span>
          </h1>

          <p className="mt-4 text-lg text-[#F6F0E4]/75 max-w-2xl">
            Bem-vindo ao sistema de limpeza do apartamento. Aqui você acompanha
            tarefas, rankings, históricos e pedidos — sem desculpa pra deixar a
            pia suja.
          </p>

        </div>

      </section>

      {/* RECADO DO DIA — nota amarela colada */}

      <div className="relative rotate-[-1deg] rounded-lg bg-[#F2A93B] border border-black/10 p-5 pl-6 shadow-md max-w-xl">

        <Tape color="bg-[#20242B]/70" />

        <div className="flex items-start gap-4">

          <Megaphone className="text-[#20242B] shrink-0 mt-1" size={22} />

          <div>
            <h2 className="font-bold text-[#20242B] [font-family:'Space_Grotesk',_sans-serif]">
              Recado do dia
            </h2>
            <p className="text-[#20242B]/80 mt-1">
              {frase}
            </p>
          </div>

        </div>

      </div>

      {/* MENU */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card
          title="Escala"
          text="Veja quem limpa o quê."
          icon={<ClipboardList size={20} />}
          color="bg-[#2F6FED]"
          onClick={() => navigate("/tarefas")}
        />

        <Card
          title="Compras"
          text="Adicione algo na lista."
          icon={<ShoppingCart size={20} />}
          color="bg-[#F2A93B]"
          onClick={() => navigate("/compras")}
        />

        <Card
          title="Vergonha"
          text="Os maiores porcos."
          icon={<Skull size={20} />}
          color="bg-[#D64550]"
          onClick={() => navigate("/ranking-da-vergonha")}
        />

        <Card
          title="Histórico"
          text="Semanas anteriores."
          icon={<CalendarDays size={20} />}
          color="bg-[#2F9C95]"
          onClick={() => navigate("/historico")}
        />

      </div>

      {/* MURAL */}

      <section
        className="relative rounded-[28px] border border-black/5 bg-[#EDE7D8] p-8 sm:p-10 shadow-sm"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "16px 16px"
        }}
      >

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold text-[#20242B] [font-family:'Space_Grotesk',_sans-serif]">
              📌 Mural do Apartamento
            </h2>

            <p className="text-[#20242B]/60 mt-1">
              Recados, reclamações e avisos fixados aqui.
            </p>

          </div>

        </div>

        {user ? (
          <div className="mb-8 relative rounded-2xl bg-[#FBF8F1] border border-black/5 p-5 shadow-sm">

            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Escreva um recado..."
              rows={4}
              className="
                w-full
                rounded-xl
                border
                border-black/10
                bg-white
                p-4
                text-[#20242B]
                resize-none
                outline-none
                focus:ring-2
                focus:ring-[#2F6FED]
              "
            />

            <div className="flex justify-end mt-4">

              <Button onClick={publicarMensagem} className="inline-flex items-center gap-2">
                Publicar <Send size={16} />
              </Button>

            </div>

          </div>

        ) : (
          <NavLink
            to="/admin"
            className="group flex items-center gap-3 mb-8 rounded-2xl bg-[#20242B]/5 border border-[#20242B]/10 p-5 hover:bg-[#20242B]/10 transition"
          >
            <Lock size={18} className="text-[#20242B]/60" />
            <p className="text-[#20242B]/80">
              Faça login para escrever no mural.
            </p>
          </NavLink>
        )}

        <div className="grid sm:grid-cols-2 gap-6">

          {messages.length === 0 ? (

            <div className="sm:col-span-2 py-12 text-center border-2 border-dashed border-[#20242B]/15 rounded-2xl">

              <h3 className="text-lg font-semibold text-[#20242B]">
                Nenhum recado ainda
              </h3>

              <p className="text-[#20242B]/50 mt-2">
                Seja o primeiro a escrever no mural da república! 🎉
              </p>

            </div>

          ) : (

            messages.map((msg, i) => {
              const rotations = ["-rotate-1", "rotate-0", "rotate-1"];
              const rotation = rotations[i % rotations.length];
              const tape = TAPE_COLORS[i % TAPE_COLORS.length];

              return (
                <div
                  key={msg.id}
                  className={`relative ${rotation} bg-[#FBF8F1] border border-black/5 rounded-xl p-5 pt-7 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:rotate-0 transition-all duration-200`}
                >

                  <Tape color={tape} />

                  <div className="flex justify-between items-baseline">

                    <h3 className="font-bold text-[#20242B] [font-family:'Space_Grotesk',_sans-serif]">
                      {msg.autor}
                    </h3>

                    <span className="text-xs font-mono text-[#20242B]/40">
                      agora
                    </span>

                  </div>

                  <p className="mt-3 text-[#20242B]/80 whitespace-pre-wrap">
                    {msg.mensagem}
                  </p>

                </div>
              );
            })

          )}

        </div>

      </section>

    </div>
  );
}

function Tape({ color = "bg-[#F2A93B]" }: { color?: string }) {
  return (
    <span
      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2 h-4 w-14 ${color} opacity-90 shadow-sm rounded-[1px]`}
    />
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
      group
      text-left
      rounded-2xl
      overflow-hidden
      border
      border-black/5
      bg-[#FBF8F1]
      shadow-sm
      hover:shadow-lg
      hover:-translate-y-1
      transition-all
      duration-200
      "
    >

      <div className={`h-1.5 w-full ${color}`} />

      <div className="p-6">

        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${color} text-white mb-4`}>
          {icon}
        </div>

        <h3 className="font-bold text-lg text-[#20242B] [font-family:'Space_Grotesk',_sans-serif]">
          {title}
        </h3>

        <p className="text-[#20242B]/55 mt-1.5 text-sm">
          {text}
        </p>

        <div className="flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#20242B]/70 group-hover:text-[#20242B] group-hover:gap-2.5 transition-all">
          Abrir
          <ArrowRight size={14} />
        </div>

      </div>

    </button>

  );

}