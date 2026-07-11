import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      setIsLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">

      {/* Elementos decorativos */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-40" />


      {/* Botão voltar */}
      <button
        onClick={() => navigate(-1)}
        className="
          absolute top-6 left-6
          flex items-center gap-2
          px-4 py-2
          bg-white/70 backdrop-blur
          border border-white
          rounded-xl
          text-gray-700
          shadow-sm
          hover:bg-white
          hover:shadow-md
          transition-all
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>


      {/* Card */}
      <div
        className="
          relative z-10
          w-full max-w-md
          bg-white/80 backdrop-blur-xl
          border border-white
          rounded-3xl
          shadow-2xl
          p-8
        "
      >

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="
              w-16 h-16
              rounded-2xl
              bg-gradient-to-br from-blue-600 to-indigo-600
              flex items-center justify-center
              shadow-lg
            "
          >
            <span className="text-3xl">
              🧹
            </span>
          </div>
        </div>


        {/* Título */}
        <div className="text-center mb-8">

          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Apto 404
            </h1>

            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>

          <p className="mt-3 text-gray-500">
            Acesso administrativo do sistema
          </p>

        </div>


        <form onSubmit={handleLogin} className="space-y-5">


          {error && (
            <div
              className="
                p-4
                bg-red-50
                border border-red-200
                text-red-700
                rounded-xl
                text-sm
              "
            >
              {error}
            </div>
          )}


          {/* Email */}
          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>

            <div className="relative">

              <Mail
                className="
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  w-5 h-5
                  text-gray-400
                "
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="
                  w-full
                  pl-12 pr-4 py-3
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  outline-none
                  transition

                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-500/30
                  focus:border-blue-500
                "
                required
              />

            </div>

          </div>


          {/* Senha */}
          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>

            <div className="relative">

              <Lock
                className="
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  w-5 h-5
                  text-gray-400
                "
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full
                  pl-12 pr-4 py-3
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  outline-none
                  transition

                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-500/30
                  focus:border-blue-500
                "
                required
              />

            </div>

          </div>


          <Button
            type="submit"
            className="
              w-full
              mt-6
              py-3
              rounded-xl
              text-base
              shadow-lg
              hover:shadow-xl
              transition-all
            "
            isLoading={isLoading}
          >
            Entrar
          </Button>


        </form>


        <p className="text-center text-xs text-gray-400 mt-8">
          🏠 Gerenciamento inteligente da república
        </p>


      </div>

    </div>
  );
}