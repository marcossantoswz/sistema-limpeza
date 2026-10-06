# Sistema de Limpeza - República

Um sistema completo para organizar e distribuir automaticamente as tarefas semanais de limpeza em um apartamento ou república dividida. Criado para resolver o problema de distribuição injusta de tarefas domésticas, o projeto conta com um **algoritmo inteligente** de agendamento que leva em conta o histórico de limpeza, aplica punições para quem "vacila", e garante que todos façam sua parte.

## Funcionalidades

- **Distribuição Automática de Tarefas:** Sorteio e distribuição semanal justa usando um algoritmo baseado em peso e histórico de tarefas.
- **Sistema de Folgas:** Se houver mais moradores do que tarefas, o sistema automaticamente distribui folgas, priorizando quem trabalha há mais semanas seguidas e possui bom histórico.
- **Sistema de Punição:** Quem não faz a tarefa fica com "nome sujo". O sistema penaliza moradores com tarefas pendentes, diminuindo a chance de folga e aumentando a chance de pegar as tarefas mais pesadas (ex: banheiro).
- **Repetição de Tarefas:** Quem não faz uma tarefa numa semana, fica travado nela na semana seguinte.
- **Restrição de Lado (Esquerdo/Direito):** Algumas tarefas (como Banheiro 1 e 2) são restritas a quem fica do lado correspondente do apartamento. O algoritmo entende e respeita essa proximidade, inclusive "resgatando" de folga se não houver outra opção.
- **Rankings:**
  - **Ranking Geral:** Os moradores que mais colaboram.
  - **Dirty Ranking (Ficha Suja):** Mostra os moradores mais penalizados pelo sistema Detox.
- **Lista de Compras:** Gestão compartilhada do que precisa ser comprado para o apartamento.
- **Histórico:** Visualização de semanas anteriores para manter a transparência.

## Stack Tecnológica

O projeto foi construído utilizando as seguintes tecnologias:

- **Frontend:** React 19, TypeScript, Vite
- **Estilização:** Tailwind CSS v4, Lucide React (Ícones)
- **Backend / Banco de Dados:** Supabase
- **Linting:** Oxlint

## Como o Algoritmo Funciona

A "mágica" da distribuição fica em `src/utils/scheduler/schedulerAlgorithm.ts`. O algoritmo segue estas regras principais:

1. **Janela de Detox:** Avalia o histórico recente das últimas 3 tarefas atribuídas a cada morador. Vacilos recentes somam pontos de punição (`penaltyScore`).
2. **Tarefas Pendentes:** Se você não fez a tarefa anterior, vai repetir a tarefa. O sistema te "trava" nela. Se foi o "Lixo", você entra na roleta mas ganha punição máxima para não ter folga e pegar uma tarefa com peso alto.
3. **Prioridade de Folgas:** Folgas vão para quem: (1) Tem ficha limpa (sem penalidades), (2) Está há mais tempo sem folga, (3) Teve menos folgas no histórico total.
4. **Restrição Geográfica:** Tenta achar candidatos para tarefas com lado definido (`Banheiro 1` = direito, `Banheiro 2` = esquerdo). Se o único disponível do lado já estava de folga, o algoritmo faz o "resgate", tira ele da folga e coloca outra pessoa livre de obrigações no lugar.
5. **Balanceamento de Carga e Repetições:** Evita que a pessoa faça a mesma tarefa duas vezes seguidas se tiver mais gente livre. A escolha prioriza quem fez menos pontos acumulados (peso) até hoje, e joga o peso extra das tarefas difíceis para os moradores punidos.

## Como Rodar o Projeto Localmente

1. **Clone o repositório** e acesse a pasta do projeto.
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto com as chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```
4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
5. **Acesse** o projeto em `http://localhost:5173`.
