-- SafeKitchen | Fase 3 | Afastamentos
-- Migracao aditiva: cria somente a tabela afastamentos.
-- Nao altera dados, tabelas ou politicas existentes.

create table public.afastamentos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  funcionario_id bigint not null,
  acidente_id bigint,
  categoria text not null,
  setor text not null default '',
  atividade text not null default '',
  data_inicio date not null,
  previsao_retorno date,
  data_retorno date,
  situacao text not null default 'em_andamento',
  motivo_cancelamento text not null default '',
  referencia_documental text not null default '',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint afastamentos_categoria_check
    check (categoria in (
      'relacionado_trabalho',
      'nao_relacionado_trabalho',
      'administrativo'
    )),
  constraint afastamentos_situacao_check
    check (situacao in ('em_andamento', 'encerrado', 'cancelado')),
  constraint afastamentos_previsao_check
    check (previsao_retorno is null or previsao_retorno >= data_inicio),
  constraint afastamentos_retorno_check
    check (data_retorno is null or data_retorno >= data_inicio),
  constraint afastamentos_encerrado_check
    check (situacao <> 'encerrado' or data_retorno is not null),
  constraint afastamentos_andamento_check
    check (situacao <> 'em_andamento' or data_retorno is null),
  constraint afastamentos_cancelado_check
    check (situacao <> 'cancelado' or btrim(motivo_cancelamento) <> ''),
  constraint afastamentos_acidente_categoria_check
    check (acidente_id is null or categoria = 'relacionado_trabalho'),

  -- Chaves compostas: garantem no proprio banco que o funcionario e o
  -- acidente pertencem ao mesmo usuario. O funcionario nao pode ser
  -- excluido enquanto houver afastamentos (usar situacao "desligado").
  constraint afastamentos_funcionario_fkey
    foreign key (funcionario_id, user_id)
    references public.funcionarios (id, user_id),
  constraint afastamentos_acidente_fkey
    foreign key (acidente_id, user_id)
    references public.acidentes (id, user_id)
    on delete set null (acidente_id)
);

create index afastamentos_user_situacao_idx
  on public.afastamentos (user_id, situacao);

create index afastamentos_user_inicio_idx
  on public.afastamentos (user_id, data_inicio desc);

create index afastamentos_funcionario_idx
  on public.afastamentos (funcionario_id);

create index afastamentos_acidente_idx
  on public.afastamentos (acidente_id)
  where acidente_id is not null;

create trigger afastamentos_set_updated_at
  before update on public.afastamentos
  for each row execute function public.sk_set_updated_at();

alter table public.afastamentos enable row level security;

revoke all on table public.afastamentos from anon;
grant select, insert, update, delete on table public.afastamentos to authenticated;

create policy "Afastamentos selecionar proprio usuario"
  on public.afastamentos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Afastamentos inserir proprio usuario"
  on public.afastamentos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Afastamentos atualizar proprio usuario"
  on public.afastamentos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Afastamentos excluir proprio usuario"
  on public.afastamentos for delete to authenticated
  using ((select auth.uid()) = user_id);