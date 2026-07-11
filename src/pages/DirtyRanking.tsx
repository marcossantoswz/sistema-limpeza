import React from 'react';
import { useDirtyRanking } from '../hooks/useDirtyRanking';
import { Loader } from '../components/ui/Loader';

import {
  Skull,
  Trash2,
  AlertTriangle,
  Trophy
} from 'lucide-react';


function getDirtyTitle(score) {

  if (score >= 100) {
    return {
      title: "🐷 Porco de chernobyl",
      text: "Transformou a sujeira em estilo de vida"
    };
  }

  if (score >= 80) {
    return {
      title: "🐀 Rato da Savassi",
      text: "Já considera a bagunça um habitat natural"
    };
  }

  if (score >= 60) {
    return {
      title: "🌊 Rio Tietê",
      text: "Um ecossistema próprio surgiu aqui"
    };
  }

  if (score >= 40) {
    return {
      title: "🗑️ Lixeira Ambulante",
      text: "Deixa sua marca por onde passa"
    };
  }

  if (score >= 25) {
    return {
      title: "🦠 Colônia de Bactérias",
      text: "A ciência está investigando"
    };
  }

  if (score >= 10) {
    return {
      title: "🐭 Rato de Esgoto",
      text: "Pouca sujeira, grande potencial"
    };
  }

  return {
    title: "✨ Quase Limpo",
    text: "Ainda há esperança"
  };
}



export function DirtyRanking() {

  const {
    ranking,
    isLoading
  } = useDirtyRanking();


  if (isLoading)
    return <Loader />;


  return (

    <div className="p-6">


      <div className="flex items-center gap-3 mb-8">

        <Skull 
          size={40}
          className="text-red-600"
        />

        <div>

          <h1 className="text-3xl font-bold">
            Ranking dos porcos
          </h1>

          <p className="text-gray-500">
            Os maiores inimigos da limpeza 🗑️
          </p>

        </div>

      </div>



      <div className="space-y-4">


        {ranking.map((user, index) => {

            const score = user.tarefas_perdidas * 20 + user.peso_acumulado;
            const level = getDirtyTitle(score);


          return (

            <div
              key={user.morador_id}
              className="
                flex
                justify-between
                items-center
                p-5
                rounded-xl
                border
                border-red-200
                bg-red-50
              "
            >


              <div className="flex items-center gap-5">


                <div className="text-2xl font-bold">
                  #{index + 1}
                </div>


                <div>

                  <h2 className="font-bold text-lg">
                    {user.nome}
                  </h2>


                  <p className="text-red-600 font-semibold">
                    {level.title}
                  </p>


                  <p className="text-sm text-gray-600">
                    {level.text}
                  </p>


                </div>


              </div>


                <div className="flex flex-col items-end">

                <div className="flex items-center gap-2">
                    <Trash2 className="text-red-600"/>
                    <span className="font-bold">
                    {score} pts
                    </span>
                </div>

                <span className="text-xs text-gray-500">
                    {user.tarefas_perdidas} furos • {user.peso_acumulado} pts de histórico
                </span>

                </div>


            </div>

          );

        })}


      </div>



      <div className="
        mt-8
        flex
        gap-2
        items-center
        text-gray-500
      ">

        <AlertTriangle size={18}/>

        <span>
          Quanto maior a pontuação, pior a situação.
        </span>

      </div>


    </div>

  );
}