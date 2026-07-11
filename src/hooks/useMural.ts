import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export function useMural() {

    const [messages, setMessages] = useState([]);

    async function load() {

        const { data } = await supabase
            .from("mural")
            .select("*")
            .order("created_at", { ascending: false });

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