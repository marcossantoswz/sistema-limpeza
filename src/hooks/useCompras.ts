import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export interface Compra {
  id: string;
  item: string;
  quantidade: string | null;
  urgente: boolean;
  comprado: boolean;
  autor: string | null;
  created_at: string;
}

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function carregarCompras() {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("lista_compras")
      .select("*")
      .order("urgente", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setCompras(data || []);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    carregarCompras();
  }, []);

  return {
    compras,
    isLoading,
    refetch: carregarCompras
  };
}