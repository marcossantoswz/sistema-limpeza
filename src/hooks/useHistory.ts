import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";


export function useHistory() {

  const [weeks,setWeeks] = useState<any[]>([]);
  const [isLoading,setIsLoading] = useState(true);


  async function fetchHistory(){

    setIsLoading(true);


    const {data,error} = await supabase
      .from("semanas")
      .select(`
        id,
        data_inicio,
        data_fim,
        status,
        atribuicoes(
          id,
          status,
          peso_historico,
          moradores(
            nome
          ),
          tarefas(
            nome
          )
        )
      `)
      .eq("status","arquivada")
      .order(
        "data_inicio",
        {
          ascending:false
        }
      );


    if(error){

      console.error(
        "Erro buscando histórico:",
        error
      );

    }else{

      setWeeks(data || []);

    }


    setIsLoading(false);

  }



  useEffect(()=>{
    fetchHistory();
  },[]);



  return {
    weeks,
    isLoading,
    refetch:fetchHistory
  };

}