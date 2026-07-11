import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

interface Message {
  id: string;
  autor: string;
  mensagem: string;
  created_at: string;
}

export function useMural() {

    const [messages, setMessages] = useState<Message[]>([]);

    async function load() {

        const { data, error } = await supabase
            .from("mural")
            .select("*")
            .order("created_at", { ascending: false });


        if(error){
            console.error("Erro ao carregar mural:", error);
            return;
        }


        setMessages(data || []);

    }

    useEffect(() => {

        load();

    }, []);

    return {
        messages,
        reload: load
    };

}