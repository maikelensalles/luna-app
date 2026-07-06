create extension if not exists "pgcrypto";

-- practices: conteúdo curado, mesmo para todos os usuários
create table practices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Respiração','Movimento','Leitura','Meditação','Escrita')),
  duration_minutes int not null,
  description text,
  audio_url text,
  created_at timestamptz not null default now()
);
alter table practices enable row level security;
create policy "practices são públicas para leitura" on practices
  for select using (true);

-- quotes: reflexões curtas, mesmo para todos os usuários
create table quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null check (category in ('presença','ego','respiração','impermanência','verdade')),
  source text not null default 'Luna',
  created_at timestamptz not null default now()
);
alter table quotes enable row level security;
create policy "quotes são públicas para leitura" on quotes
  for select using (true);

-- daily_checkins: dados privados por usuário
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_id uuid references practices(id) on delete set null,
  title text not null,
  check_date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, title, check_date)
);
create index daily_checkins_user_date_idx on daily_checkins (user_id, check_date);
alter table daily_checkins enable row level security;
create policy "usuário só vê seus próprios checkins" on daily_checkins
  for select using (auth.uid() = user_id);
create policy "usuário só insere seus próprios checkins" on daily_checkins
  for insert with check (auth.uid() = user_id);
create policy "usuário só atualiza seus próprios checkins" on daily_checkins
  for update using (auth.uid() = user_id);

-- seed: practices (mesmos itens de mockPraticas.ts)
insert into practices (title, category, duration_minutes) values
  ('Respiração 4-7-8', 'Respiração', 5),
  ('Alongamento matinal', 'Movimento', 10),
  ('Leitura contemplativa do dia', 'Leitura', 8),
  ('Body scan guiado', 'Meditação', 12),
  ('Caminhada consciente', 'Movimento', 15),
  ('Diário de presença', 'Escrita', 7);

-- seed: quotes (reflexões originais, categorizadas)
insert into quotes (text, category) values
  ('Você não precisa chegar a lugar nenhum. Já está exatamente onde a vida está acontecendo.', 'presença'),
  ('O relógio se move. Você, não. Você está sempre aqui, só o ponteiro muda de lugar.', 'presença'),
  ('Soltar o controle não é perder — é finalmente parar de carregar algo que nunca foi seu para segurar.', 'ego'),
  ('A borboleta não planeja o voo. Ela só para de ser lagarta.', 'ego'),
  ('Uma respiração não pede nada do futuro. Ela só pede que você a note.', 'respiração'),
  ('Inspire como se fosse a primeira vez. Expire como se fosse a última.', 'respiração'),
  ('Tudo que você segura com força é, por definição, algo que já está passando.', 'impermanência'),
  ('O sofrimento também passa — não porque você o resolveu, mas porque nada fica parado.', 'impermanência'),
  ('Mentir exige distância. A verdade não precisa de espaço nenhum entre você e o outro.', 'verdade'),
  ('Você só muda o mundo mudando a única pessoa que está sob seu controle real: você.', 'verdade');
