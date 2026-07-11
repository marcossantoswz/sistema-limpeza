import React,{useState} from "react";
import {useHistory} from "../hooks/useHistory";
import {Loader} from "../components/ui/Loader";

import {
 CalendarDays,
 CheckCircle2,
 XCircle,
 Coffee,
 ChevronDown
} from "lucide-react";


export function Historico(){


const {
 weeks,
 isLoading
}=useHistory();


const [opened,setOpened]=useState<string|null>(null);



if(isLoading)
 return (
 <Loader
 size="lg"
 className="mt-20"
 />
 );




return (

<div className="
max-w-5xl
mx-auto
space-y-8
">



<section
className="
bg-gradient-to-br
from-slate-900
to-blue-900
rounded-3xl
p-8
text-white
shadow-xl
"
>


<div className="
flex
items-center
gap-3
">

<CalendarDays/>

<h1 className="
text-3xl
font-bold
">
Histórico de Escalas
</h1>


</div>


<p className="
text-slate-300
mt-2
">
Veja todas as semanas já finalizadas.
</p>


</section>





{
weeks.map((week)=>{


const tarefasDaSemana = week.atribuicoes.filter(
  (a:any) => a.tarefas !== null
);

const total = tarefasDaSemana.length;

const concluidas = tarefasDaSemana.filter(
  (a:any) => a.status === "concluida"
).length;

const porcentagem =
total
?
Math.round(
(concluidas/total)*100
)
:
0;




return (

<div
key={week.id}
className="
bg-white
rounded-3xl
shadow-sm
border
overflow-hidden
"
>



<button

onClick={()=>setOpened(
 opened===week.id
 ?null
 :week.id
)}

className="
w-full
p-6
flex
justify-between
items-center
hover:bg-gray-50
transition
"

>


<div
className="
text-left
">


<h2 className="
font-bold
text-xl
text-gray-900
">

{
new Date(
week.data_inicio
).toLocaleDateString(
"pt-BR"
)
}

{" - "}

{
new Date(
week.data_fim
).toLocaleDateString(
"pt-BR"
)
}

</h2>


<p className="
text-sm
text-gray-500
mt-1
">

{porcentagem}% concluída

</p>


</div>


<ChevronDown/>


</button>






{
opened===week.id && (

<div className="
border-t
p-6
space-y-3
">


{
week.atribuicoes.map(
(a:any)=>(


<div
key={a.id}
className="
flex
items-center
justify-between
p-4
rounded-2xl
bg-gray-50
"
>


<div>


<h3 className="
font-bold
text-gray-900
">

{
a.tarefas
?
a.tarefas.nome
:
"Folga"
}

</h3>


<p className="
text-sm
text-gray-500
">

{a.moradores.nome}

</p>


{
a.tarefas &&
(
<span className="
text-xs
bg-blue-100
text-blue-700
px-2
py-1
rounded-full
">

Peso {a.peso_historico}

</span>
)

}


</div>





{
!a.tarefas
?

<Coffee
className="
text-amber-500
"
/>


:

a.status==="concluida"

?

<CheckCircle2
className="
text-green-500
"
/>

:

<XCircle
className="
text-red-500
"
/>


}



</div>


))

}



</div>

)

}




</div>


)


})

}




</div>

)

}