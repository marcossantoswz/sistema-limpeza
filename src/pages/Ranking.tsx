import React from 'react';
import { useRanking } from '../hooks/useRanking';
import { Loader } from '../components/ui/Loader';
import {
  Trophy,
  Target,
  Coffee,
  XCircle,
  Medal,
  TrendingUp
} from 'lucide-react';


export function Ranking() {
  const { ranking, isLoading } = useRanking();


  if (isLoading)
    return <Loader size="lg" className="mt-20" />;


  return (
    <div className="max-w-5xl mx-auto space-y-8">


      {/* Header */}
      <section
        className="
          relative overflow-hidden
          rounded-3xl
          bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600
          p-8
          text-white
          shadow-xl
        "
      >

        <div className="
          absolute
          -right-20
          -top-20
          w-64 h-64
          bg-white/10
          rounded-full
        "/>


        <div className="relative">

          <div className="flex items-center gap-3 mb-3">

            <div className="
              p-3
              bg-white/20
              rounded-2xl
              backdrop-blur
            ">
              <Trophy size={30}/>
            </div>


            <h1 className="text-3xl font-bold">
              Ranking do Apartamento
            </h1>

          </div>


          <p className="text-blue-100 max-w-xl">
            Classificação baseada no desempenho dos moradores,
            considerando tarefas concluídas, faltas e histórico.
          </p>


        </div>

      </section>



      {/* Ranking */}
      <div className="space-y-5">


        {ranking.map((item,index)=>(

          <div
            key={item.morador_id}
            className="
              group
              bg-white
              rounded-2xl
              border border-gray-100
              shadow-sm
              hover:shadow-xl
              transition-all
              duration-300
              p-5
            "
          >

            <div className="
              flex
              flex-col
              md:flex-row
              md:items-center
              justify-between
              gap-5
            ">


              {/* Pessoa */}
              <div className="flex items-center gap-4">


                <div
                  className={`
                    relative
                    w-14 h-14
                    rounded-2xl
                    flex items-center justify-center
                    font-bold
                    shadow-sm

                    ${
                      index === 0
                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white'
                      :
                      index === 1
                      ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-white'
                      :
                      index === 2
                      ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white'
                      :
                      'bg-blue-50 text-blue-600'
                    }
                  `}
                >

                  {
                    index < 3
                    ?
                    <Medal size={28}/>
                    :
                    index + 1
                  }


                </div>


                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    {item.nome}
                  </h2>


                  <div className="flex items-center gap-1 text-sm text-gray-500">

                    <TrendingUp size={15}/>

                    {index === 0
                      ? 'Melhor desempenho'
                      : `${index + 1}º colocado`
                    }

                  </div>

                </div>


              </div>




              {/* Estatísticas */}
              <div className="
                grid
                grid-cols-2
                sm:grid-cols-4
                gap-3
              ">


                <StatCard
                  icon={<Target size={18}/>}
                  label="Feitas"
                  value={item.tarefas_concluidas}
                  color="text-emerald-600"
                />


                <StatCard
                  icon={<XCircle size={18}/>}
                  label="Falhas"
                  value={item.tarefas_perdidas}
                  color="text-red-500"
                />


                <StatCard
                  icon={<Coffee size={18}/>}
                  label="Folgas"
                  value={item.total_folgas}
                  color="text-amber-600"
                />


                <StatCard
                  icon={<Trophy size={18}/>}
                  label="Pontos"
                  value={item.peso_acumulado}
                  color="text-blue-600"
                  highlight
                />


              </div>


            </div>


          </div>


        ))}



        {
          ranking.length === 0 && (

            <div
              className="
                bg-white
                rounded-2xl
                border
                p-10
                text-center
                text-gray-500
              "
            >
              Nenhum morador cadastrado ainda.
            </div>

          )
        }


      </div>


    </div>
  );
}




function StatCard({
  icon,
  label,
  value,
  color,
  highlight=false
}:{
  icon:React.ReactNode;
  label:string;
  value:number;
  color:string;
  highlight?:boolean;
}){

  return (

    <div
      className={`
        flex
        items-center
        gap-2
        px-3
        py-2
        rounded-xl

        ${
          highlight
          ?
          'bg-blue-50'
          :
          'bg-gray-50'
        }
      `}
    >

      <span className={color}>
        {icon}
      </span>


      <div>

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="font-bold text-gray-900">
          {value}
        </p>

      </div>


    </div>

  )

}