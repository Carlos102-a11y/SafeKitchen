-- SafeKitchen | Fase 5 | PPP (apoio a conferencia)
-- Migracao aditiva: nao altera dados existentes.

-- 1. Unicidades auxiliares (necessarias para chaves compostas que garantem
--    que os registros vinculados pertencem ao mesmo usuario)
alter table public.pgr
  add constraint pgr_id_user_id_key unique (id, user_id);

alter table public.epis
  add constraint epis_id_user_id_key unique (id, user_id);

alter table public.ltcat_revisoes
  add constraint ltcat_revisoes_id_user_id_key unique (id, user_id);

-- 2. Identificacao do trabalhador (um cadastro por funcionario)
create table public.ppp_cadastros (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  funcionario_id bigint not null,
  cpf text not null default '',
  nit text not null default '',
  data_nascimento date,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ppp_cadastros_funcionario_key unique (funcionario_id),
  constraint ppp_cadastros_cpf_check check (cpf ~ '^([0-9]{11})?$'),
  constraint ppp_cadastros_nit_check check (nit ~ '^([0-9]{11})?$'),
  -- Dados pessoais acompanham o funcionario: se ele for excluido, o cadastro tambem.
  constraint ppp_cadastros_funcionario_fkey
    foreign key (funcionario_id, user_id)
    references public.funcionarios (id, user_id)
    on delete cascade
);

-- 3. Historico profissional (periodos de setor, funcao e atividades)
create table public.funcionario_historico (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  funcionario_id bigint not null,
  data_inicio date not null,
  data_fim date,
  setor text not null default '',
  funcao text not null default '',
  cbo text not null default '',
  atividades text not null default '',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funcionario_historico_periodo_check
    check (data_fim is null or data_fim >= data_inicio),
  constraint funcionario_historico_funcionario_fkey
    foreign key (funcionario_id, user_id)
    references public.funcionarios (id, user_id)
);

-- 4. Condicoes ambientais / exposicoes, sempre ligadas a fonte e periodo
create table public.ppp_exposicoes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  funcionario_id bigint not null,
  periodo_inicio date not null,
  periodo_fim date,
  setor text not null default '',
  atividade text not null default '',
  tipo_agente text not null,
  agente text not null default '',
  tipo_avaliacao text not null default 'nao_informada',
  resultado text not null default '',
  unidade text not null default '',
  metodologia text not null default '',
  medidas_coletivas text not null default '',
  epi_id bigint,
  epi_eficaz text not null default 'nao_informado',
  ltcat_revisao_id bigint,
  pgr_id bigint,
  fonte_descricao text not null default '',
  responsavel_nome text not null default '',
  responsavel_registro text not null default '',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ppp_exposicoes_periodo_check
    check (periodo_fim is null or periodo_fim >= periodo_inicio),
  constraint ppp_exposicoes_tipo_agente_check
    check (tipo_agente in (
      'fisico', 'quimico', 'biologico', 'ergonomico', 'acidente', 'ausencia'
    )),
  constraint ppp_exposicoes_agente_check
    check (tipo_agente = 'ausencia' or btrim(agente) <> ''),
  constraint ppp_exposicoes_avaliacao_check
    check (tipo_avaliacao in ('nao_informada', 'qualitativa', 'quantitativa')),
  constraint ppp_exposicoes_epi_eficaz_check
    check (epi_eficaz in ('nao_informado', 'sim', 'nao')),
  constraint ppp_exposicoes_funcionario_fkey
    foreign key (funcionario_id, user_id)
    references public.funcionarios (id, user_id),
  -- Revisoes de LTCAT nunca sao excluidas.
  constraint ppp_exposicoes_ltcat_fkey
    foreign key (ltcat_revisao_id, user_id)
    references public.ltcat_revisoes (id, user_id),
  -- PGR e EPIs podem ser excluidos nos seus modulos: o vinculo apenas se desfaz.
  constraint ppp_exposicoes_pgr_fkey
    foreign key (pgr_id, user_id)
    references public.pgr (id, user_id)
    on delete set null (pgr_id),
  constraint ppp_exposicoes_epi_fkey
    foreign key (epi_id, user_id)
    references public.epis (id, user_id)
    on delete set null (epi_id)
);

create index funcionario_historico_funcionario_idx
  on public.funcionario_historico (funcionario_id, data_inicio);

create index ppp_exposicoes_funcionario_idx
  on public.ppp_exposicoes (funcionario_id, periodo_inicio);

create index ppp_exposicoes_ltcat_idx
  on public.ppp_exposicoes (ltcat_revisao_id)
  where ltcat_revisao_id is not null;

create trigger ppp_cadastros_set_updated_at
  before update on public.ppp_cadastros
  for each row execute function public.sk_set_updated_at();

create trigger funcionario_historico_set_updated_at
  before update on public.funcionario_historico
  for each row execute function public.sk_set_updated_at();

create trigger ppp_exposicoes_set_updated_at
  before update on public.ppp_exposicoes
  for each row execute function public.sk_set_updated_at();

-- 5. Seguranca (RLS)
alter table public.ppp_cadastros enable row level security;
alter table public.funcionario_historico enable row level security;
alter table public.ppp_exposicoes enable row level security;

revoke all on table public.ppp_cadastros from anon;
revoke all on table public.funcionario_historico from anon;
revoke all on table public.ppp_exposicoes from anon;

grant select, insert, update, delete on table public.ppp_cadastros to authenticated;
grant select, insert, update, delete on table public.funcionario_historico to authenticated;
grant select, insert, update, delete on table public.ppp_exposicoes to authenticated;

create policy "PPP cadastros selecionar proprio usuario"
  on public.ppp_cadastros for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "PPP cadastros inserir proprio usuario"
  on public.ppp_cadastros for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "PPP cadastros atualizar proprio usuario"
  on public.ppp_cadastros for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "PPP cadastros excluir proprio usuario"
  on public.ppp_cadastros for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "PPP historico selecionar proprio usuario"
  on public.funcionario_historico for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "PPP historico inserir proprio usuario"
  on public.funcionario_historico for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "PPP historico atualizar proprio usuario"
  on public.funcionario_historico for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "PPP historico excluir proprio usuario"
  on public.funcionario_historico for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "PPP exposicoes selecionar proprio usuario"
  on public.ppp_exposicoes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "PPP exposicoes inserir proprio usuario"
  on public.ppp_exposicoes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "PPP exposicoes atualizar proprio usuario"
  on public.ppp_exposicoes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "PPP exposicoes excluir proprio usuario"
  on public.ppp_exposicoes for delete to authenticated
  using ((select auth.uid()) = user_id);