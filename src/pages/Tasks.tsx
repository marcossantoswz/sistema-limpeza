import React, { useState } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useRanking } from '../hooks/useRanking';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { closeAndGenerateWeek } from '../services/api';
import {
  AlertTriangle,
  Coffee,
  CheckCircle2,
  ClipboardList,
  Sparkles
} from 'lucide-react';


export function Tasks() {

  const {
    assignments,
    isLoading,
    toggleTaskStatus,
    refetch
  } = useSchedule();


  const { ranking } = useRanking();
  const { user } = useAuth();


  const [isClosing,setIsClosing] = useState(false);



  const tarefasDaSemana = assignments.filter(
    a => a.tarefas !== null
  );


  const totalTarefas = tarefasDaSemana.length;


  const feitas = tarefasDaSemana.filter(
    a => a.status === 'concluida'
  ).length;


  const progresso =
    totalTarefas > 0
    ? (feitas / totalTarefas) * 100
    : 0;



  const pioresMoradores = [...ranking]
    .sort(
      (a,b)=>
      b.tarefas_perdidas -
      a.tarefas_perdidas
    )
    .filter(
      m=>m.tarefas_perdidas>0
    )
    .slice(0,2);



  async function handleCloseWeek(){

    if(!window.confirm('Fechar semana e gerar nova escala?'))
      return;


    setIsClosing(true);

    await closeAndGenerateWeek();

    await refetch();

    setIsClosing(false);

  }



  if(isLoading)
    return <Loader size="lg" className="mt-20"/>



  return (

    <div className="
      max-w-5xl
      mx-auto
      space-y-8
      p-4 md:p-6
    ">



      {/* ALERTA */}
      {
        pioresMoradores.length>0 && (

          <div
            className="
              flex
              gap-4
              items-center
              p-5
              rounded-2xl
              bg-gradient-to-r
              from-red-500
              to-rose-600
              text-white
              shadow-lg
            "
          >

            <div className="
              p-3
              bg-white/20
              rounded-xl
            ">
              <AlertTriangle/>
            </div>


            <div>

              <h3 className="font-bold text-lg">
                Atenção na escala
              </h3>


              <p className="text-sm text-red-100">

                {pioresMoradores
                  .map(m=>m.nome)
                  .join(' e ')
                }

                {' '}
                possuem tarefas pendentes.

              </p>

            </div>


          </div>

        )
      }




      {/* HEADER */}
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-slate-900
          via-blue-950
          to-indigo-900
          p-8
          text-white
          shadow-xl
        "
      >

        <div className="
          absolute
          -right-20
          -top-20
          w-72
          h-72
          bg-blue-500/20
          rounded-full
          blur-3xl
        "/>


        <div className="relative">


          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            justify-between
            gap-5
          ">


            <div>

              <div className="
                flex
                items-center
                gap-2
                mb-2
              ">


              </div>



              <h1 className="
                text-3xl
                font-bold
              ">
                Escala da Semana
              </h1>


              <p className="
                text-slate-300
                mt-2
              ">
                Organização das tarefas
              </p>

            </div>




            {
              user && (

                <Button

                  onClick={handleCloseWeek}

                  isLoading={isClosing}

                  className="
                    bg-emerald-400
                    text-slate-900
                    hover:bg-emerald-300
                    rounded-xl
                    font-bold
                  "
                >

                  Finalizar semana

                </Button>

              )
            }


          </div>




          {/* PROGRESSO */}

          <div className="mt-8">


            <div className="
              flex
              justify-between
              text-sm
              mb-2
            ">

              <span className="text-slate-300">
                Progresso
              </span>


              <span className="font-bold">
                {Math.round(progresso)}%
              </span>

            </div>



            <div className="
              h-4
              bg-white/20
              rounded-full
              overflow-hidden
            ">


              <div
                className="
                  h-full
                  bg-gradient-to-r
                  from-emerald-400
                  to-green-300
                  transition-all
                  duration-700
                "
                style={{
                  width:`${progresso}%`
                }}
              />


            </div>


          </div>



        </div>


      </section>





      {/* TAREFAS */}

      <div className="space-y-4">


      {
        assignments.map((assignment)=>(


          assignment.tarefas ?


          <div
            key={assignment.id}
            className="
              group
              bg-white
              rounded-2xl
              border
              border-gray-100
              p-5
              shadow-sm
              hover:shadow-lg
              transition
            "
          >


            <div className="
              flex
              flex-col
              sm:flex-row
              justify-between
              gap-4
              sm:items-center
            ">


              <div className="
                flex
                items-center
                gap-4
              ">


                <div className="
                  p-3
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                ">
                  <ClipboardList/>
                </div>



                <div>

                  <h3 className="
                    font-bold
                    text-gray-900
                  ">
                    {assignment.tarefas.nome}
                  </h3>


                  <p className="
                    text-sm
                    text-gray-500
                  ">
                    {assignment.moradores.nome}
                  </p>


                  <span className="
                    inline-block
                    mt-1
                    text-xs
                    bg-gray-100
                    px-2
                    py-1
                    rounded-lg
                  ">
                    Peso {assignment.peso_historico}
                  </span>

                </div>


              </div>



              {
                user && (

                  <button
                    onClick={() =>
                      toggleTaskStatus(
                        assignment.id,
                        assignment.status
                      )
                    }

                    className={`
                      px-5
                      py-2.5
                      rounded-xl
                      font-bold
                      transition
                      flex
                      items-center
                      justify-center
                      gap-2

                      ${
                        assignment.status === 'concluida'
                        ?
                        `
                        bg-emerald-100
                        text-emerald-700
                        `
                        :
                        `
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                        `
                      }
                    `}
                  >

                    {
                      assignment.status === 'concluida'
                      ?
                      <>
                        <CheckCircle2 size={18}/>
                        Feito
                      </>
                      :
                      'Marcar'
                    }

                  </button>

                )
              }



            </div>


          </div>



          :


          <div
            key={assignment.id}
            className="
              flex
              items-center
              gap-3
              bg-amber-50
              border
              border-amber-200
              rounded-2xl
              p-5
            "
          >

            <Coffee
              className="text-amber-600"
            />


            <span className="
              font-semibold
              text-amber-900
            ">
              {assignment.moradores.nome}
              {' '}
              está de folga ☕
            </span>


          </div>


        ))
      }


      </div>


    </div>

  );
}