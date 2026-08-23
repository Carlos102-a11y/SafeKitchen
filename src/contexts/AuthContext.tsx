import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";
import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

interface AuthResult {
  error: string | null;
}

interface CadastroResult {
  error: string | null;
  precisaConfirmarEmail: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;

  entrar: (
    email: string,
    senha: string
  ) => Promise<AuthResult>;

  cadastrar: (
    nome: string,
    empresa: string,
    cargo: string,
    email: string,
    senha: string
  ) => Promise<CadastroResult>;

  sair: () => Promise<AuthResult>;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, novaSession) => {
          setSession(
            novaSession
          );

          setLoading(
            false
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function entrar(
    email: string,
    senha: string
  ): Promise<AuthResult> {
    const {
      error,
    } =
      await supabase.auth.signInWithPassword({
        email:
          email
            .trim()
            .toLowerCase(),
        password:
          senha,
      });

    return {
      error:
        error?.message ??
        null,
    };
  }

  async function cadastrar(
    nome: string,
    empresa: string,
    cargo: string,
    email: string,
    senha: string
  ): Promise<CadastroResult> {
    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email:
          email
            .trim()
            .toLowerCase(),
        password:
          senha,
        options: {
          data: {
            full_name:
              nome.trim(),
            company:
              empresa.trim(),
            role:
              cargo.trim(),
          },
        },
      });

    return {
      error:
        error?.message ??
        null,
      precisaConfirmarEmail:
        !data.session &&
        !error,
    };
  }

  async function sair(): Promise<AuthResult> {
    const {
      error,
    } =
      await supabase.auth.signOut({
        scope: "local",
      });

    return {
      error:
        error?.message ??
        null,
    };
  }

  const user =
    session?.user ??
    null;

  const value =
    useMemo(
      () => ({
        session,
        user,
        loading,
        entrar,
        cadastrar,
        sair,
      }),
      [
        session,
        user,
        loading,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto =
    useContext(
      AuthContext
    );

  if (!contexto) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return contexto;
}