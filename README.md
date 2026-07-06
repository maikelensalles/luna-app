# Luna

Meditação, yoga e presença — um app de bem-estar pessoal, sem misticismo.

<table>
  <tr>
    <td><img src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/688da5252298151.6a4c26774ba05.png" width="400"/></td>
    <td><img src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/be4779252298151.6a4c26774b43f.png" width="400"/></td>
  </tr>
</table>

## 🌙 Sobre

Luna é uma companhia contemplativa diária: um espaço simples para praticar meditação, yoga, respiração, leitura e escrita, sem gamificação ansiosa. Em vez de ofensivas (streaks) ou métricas de cobrança, a jornada semanal é representada como uma trilha visual guiada pelas fases da lua — um jeito mais silencioso de acompanhar constância.

Cada dia traz uma frase curada de reflexão e um resumo rápido da semana. As práticas ficam num catálogo simples, e o usuário monta o próprio dia adicionando ou removendo o que faz sentido — inclusive os itens padrão sugeridos. O perfil reúne nome, foto, data de entrada, estatísticas de progresso e um histórico do que já foi praticado.

A proposta é ser um MVP pessoal: enxuto, direto, sem dependência de conteúdo externo (a fase da lua, por exemplo, é calculada localmente, sem chamada a API nenhuma).

## ✨ Funcionalidades

- **Autenticação** — cadastro e login via Supabase Auth
- **Tela Hoje** — fase lunar do dia (calculada localmente, sem API externa), frase de reflexão do dia e resumo da semana
- **Tela Jornada** — trilha vertical com as práticas de hoje, cabeçalho compacto com os 7 dias da semana, conquista visual ao completar o dia
- **Tela Práticas** — catálogo de práticas com modal de detalhe, permitindo adicionar ou remover qualquer prática da jornada do dia
- **Perfil** — nome editável, foto de avatar, data de entrada, estatísticas de progresso e histórico de atividades

## 🛠️ Stack técnica

- **React Native + Expo** (Expo Router, TypeScript)
- **Supabase** — banco de dados, autenticação e storage de avatares
- **StyleSheet nativo** — sem NativeWind ou outra lib de estilo
- **react-native-svg** — desenho da trilha da Jornada
- **Fontes**: Nunito, via `@expo-google-fonts/nunito`

## 🚀 Rodando localmente

**Pré-requisitos:**
- Node.js
- Uma conta Supabase
- Xcode (para iOS) ou Android Studio (para Android)

**Passos:**

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz com:
   ```
   EXPO_PUBLIC_SUPABASE_URL=sua-url-aqui
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
   ```
4. Rode as migrations da pasta `supabase/migrations/` manualmente no SQL Editor do Supabase, na ordem dos arquivos
5. Inicie o projeto:
   ```bash
   npx expo start
   ```

## 📂 Estrutura do projeto

```
src/
├── app/          # rotas (Expo Router)
├── components/   # componentes de UI reutilizáveis
├── contexts/     # contexto de sessão/autenticação
├── hooks/        # hooks de dados (Supabase, estado de tela)
├── services/     # cliente Supabase
├── constants/    # tema (cores, tipografia, espaçamento)
├── types/        # tipos de domínio
└── utils/        # funções utilitárias compartilhadas

supabase/
└── migrations/   # migrations SQL do banco
```

## 📌 Status

Projeto pessoal em desenvolvimento (MVP), sem licença definida ainda.
