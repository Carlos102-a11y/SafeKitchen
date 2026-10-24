-- SafeKitchen | Fase 4 | LTCAT (controle documental)
-- Migracao aditiva: nao altera dados, tabelas ou politicas existentes.

create table public.ltcat_documentos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  titulo text not null,
  estabelecimento text not null default '',
  abrangencia text not null default '',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ltcat_documentos_id_user_id_key unique (id, user_id),
  constraint ltcat_documentos_titulo_check check (btrim(titulo) <> '')
);

create table public.ltcat_revisoes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  documento_id bigint not null,
  numero integer not null,
  situacao text not null default 'em_elaboracao',
  data_elaboracao date,
  data_revisao date,
  periodo_inicio date,
  periodo_fim date,
  responsavel_nome text not null default '',
  responsavel_profissao text not null default '',
  registro_profissional text not null default '',
  vigencia_validada_em date,
  vigencia_validada_por text not null default '',
  arquivo_path text,
  arquivo_nome text not null default '',
  arquivo_tamanho integer,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ltcat_revisoes_numero_check check (numero > 0),
  constraint ltcat_revisoes_documento_numero_key unique (documento_id, numero),
  constraint ltcat_revisoes_situacao_check
    check (situacao in (
      'em_elaboracao', 'vigente', 'pendente_revisao', 'substituido', 'arquivado'
    )),
  constraint ltcat_revisoes_profissao_check
    check (responsavel_profissao in (
      '', 'engenheiro_seguranca', 'medico_trabalho', 'outro'
    )),
  constraint ltcat_revisoes_periodo_check
    check (periodo_inicio is null or periodo_fim is null or periodo_fim >= periodo_inicio),
  constraint ltcat_revisoes_datas_check
    check (data_elaboracao is null or data_revisao is null or data_revisao >= data_elaboracao),
  constraint ltcat_revisoes_tamanho_check
    check (arquivo_tamanho is null or arquivo_tamanho >= 0),
  -- A vigencia so existe quando uma pessoa a validou e o dossie esta completo.
  constraint ltcat_revisoes_vigente_check
    check (
      situacao <> 'vigente'
      or (
        vigencia_validada_em is not null
        and btrim(vigencia_validada_por) <> ''
        and btrim(responsavel_nome) <> ''
        and btrim(registro_profissional) <> ''
        and data_elaboracao is not null
        and arquivo_path is not null
      )
    ),
  -- O documento e a revisao precisam ser do mesmo usuario.
  constraint ltcat_revisoes_documento_fkey
    foreign key (documento_id, user_id)
    references public.ltcat_documentos (id, user_id)
);

-- No maximo uma revisao vigente por documento.
create unique index ltcat_revisoes_vigente_key
  on public.ltcat_revisoes (documento_id)
  where situacao = 'vigente';

create index ltcat_revisoes_user_situacao_idx
  on public.ltcat_revisoes (user_id, situacao);

create index ltcat_revisoes_documento_idx
  on public.ltcat_revisoes (documento_id);

create index ltcat_documentos_user_idx
  on public.ltcat_documentos (user_id);

create trigger ltcat_documentos_set_updated_at
  before update on public.ltcat_documentos
  for each row execute function public.sk_set_updated_at();

create trigger ltcat_revisoes_set_updated_at
  before update on public.ltcat_revisoes
  for each row execute function public.sk_set_updated_at();

-- Seguranca (RLS)
alter table public.ltcat_documentos enable row level security;
alter table public.ltcat_revisoes enable row level security;

revoke all on table public.ltcat_documentos from anon;
revoke all on table public.ltcat_revisoes from anon;

grant select, insert, update, delete on table public.ltcat_documentos to authenticated;
-- Revisoes nunca sao excluidas (historico preservado): sem permissao de DELETE.
grant select, insert, update on table public.ltcat_revisoes to authenticated;

create policy "LTCAT documentos selecionar proprio usuario"
  on public.ltcat_documentos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "LTCAT documentos inserir proprio usuario"
  on public.ltcat_documentos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "LTCAT documentos atualizar proprio usuario"
  on public.ltcat_documentos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "LTCAT documentos excluir proprio usuario"
  on public.ltcat_documentos for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "LTCAT revisoes selecionar proprio usuario"
  on public.ltcat_revisoes for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "LTCAT revisoes inserir proprio usuario"
  on public.ltcat_revisoes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "LTCAT revisoes atualizar proprio usuario"
  on public.ltcat_revisoes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Funcao atomica: valida a vigencia e torna a revisao anterior "substituido".
-- Roda com as permissoes de quem chama (RLS continua valendo).
create or replace function public.ltcat_tornar_vigente(
  p_revisao_id bigint,
  p_validada_por text,
  p_validada_em date
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_documento bigint;
begin
  select documento_id into v_documento
  from public.ltcat_revisoes
  where id = p_revisao_id;

  if v_documento is null then
    raise exception 'Revisao nao encontrada.';
  end if;

  update public.ltcat_revisoes
     set situacao = 'substituido'
   where documento_id = v_documento
     and situacao = 'vigente'
     and id <> p_revisao_id;

  update public.ltcat_revisoes
     set situacao = 'vigente',
         vigencia_validada_em = p_validada_em,
         vigencia_validada_por = btrim(p_validada_por)
   where id = p_revisao_id;
end;
$$;

revoke all on function public.ltcat_tornar_vigente(bigint, text, date) from public, anon;
grant execute on function public.ltcat_tornar_vigente(bigint, text, date) to authenticated;

-- Armazenamento privado dos laudos (somente PDF, ate 10 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ltcat-documentos', 'ltcat-documentos', false, 10485760, array['application/pdf']);

create policy "LTCAT arquivos selecionar proprio usuario"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'ltcat-documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "LTCAT arquivos inserir proprio usuario"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ltcat-documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "LTCAT arquivos excluir proprio usuario"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'ltcat-documentos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );