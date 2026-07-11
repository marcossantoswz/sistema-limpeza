import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export function useDirtyRanking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchRanking() {

    setIsLoading(true);

    const { data, error } = await supabase
      .from("vw_ranking_moradores")
      .select("*")
      .order("tarefas_perdidas", { ascending: false });


    if (!error && data) {
      setRanking(data);
    }

    setIsLoading(false);
  }


  useEffect(() => {
    fetchRanking();
  }, []);


  return {
    ranking,
    isLoading,
    refetch: fetchRanking
  };
}