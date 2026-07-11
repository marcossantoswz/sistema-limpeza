import { useState } from "react";
import { useCompras } from "../hooks/useCompras";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";

import {
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Plus
} from "lucide-react";

export default function Compras() {

  const { compras, isLoading, refetch } = useCompras();
  const { user } = useAuth();

  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [urgente, setUrgente] = useState(false);

  async function adicionar() {

    if (!item.trim()) return;

    const { error } = await supabase
      .from("lista_compras")
      .insert({
        item,
        quantidade,
        urgente,
        autor: user?.email
      });

    if (error) {
      alert(error.message);
      return;
    }

    setItem("");
    setQuantidade("");
    setUrgente(false);

    refetch();
  }

  async function remover(id: string) {

    if (!window.confirm("Remover este item?")) return;

    await supabase
      .from("lista_compras")
      .delete()
      .eq("id", id);

    refetch();

  }

  if (isLoading)
    return <Loader size="lg" className="mt-20" />;

  return (

    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER */}

      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 text-white p-8 shadow-xl">

        <div className="flex items-center gap-3">

          <ShoppingCart size={34} />

          <div>

            <h1 className="text-3xl font-bold">
              Lista de Compras
            </h1>

            <p className="text-green-100">
              Tudo o que precisa ser comprado para a casa.
            </p>

          </div>

        </div>

      </section>

      {/* FORM */}

      {user && (

        <section className="bg-white rounded-3xl p-6 border shadow-sm">

          <h2 className="font-bold text-xl mb-5">
            Adicionar Item
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Item"
              className="border rounded-xl p-3"
            />

            <input
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Quantidade"
              className="border rounded-xl p-3"
            />

          </div>

          <label className="flex items-center gap-3 mt-5">

            <input
              type="checkbox"
              checked={urgente}
              onChange={(e) => setUrgente(e.target.checked)}
            />

            <span>Marcar como urgente</span>

          </label>

          <Button
            className="mt-6 flex items-center gap-2"
            onClick={adicionar}
          >

            <Plus size={18} />

            Adicionar

          </Button>

        </section>

      )}

      {/* LISTA */}

      <div className="space-y-4">

        {compras.map((c) => (

          <div
            key={c.id}
            className={`
              rounded-2xl
              border
              p-5
              flex
              justify-between
              items-center
              shadow-sm

              ${c.urgente
                ? "border-red-300 bg-red-50"
                : "bg-white border-gray-200"}
            `}
          >

            <div>

              <div className="flex items-center gap-3">

                <h2 className="font-bold text-lg">
                  {c.item}
                </h2>

                {c.urgente && (

                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">

                    <AlertTriangle size={13} />

                    URGENTE

                  </span>

                )}

              </div>

              {c.quantidade && (

                <p className="text-gray-500 mt-1">

                  {c.quantidade}

                </p>

              )}

              <p className="text-sm text-gray-400 mt-2">

                {c.autor}

              </p>

            </div>

            {user && (

              <button
                onClick={() => remover(c.id)}
                className="text-red-600 hover:bg-red-100 p-3 rounded-xl transition"
              >

                <Trash2 />

              </button>

            )}

          </div>

        ))}

        {compras.length === 0 && (

          <div className="text-center p-10 bg-white rounded-2xl border text-gray-500">

            Nenhum item na lista 🛒

          </div>

        )}

      </div>

    </div>

  );

}