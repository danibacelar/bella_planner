# Isabella's Study Planner

Planner de estudos (ELA e Math) para a Isabella. É uma página única (`index.html`) mais uma pequena função (`api/state.js`) que guarda o planner na nuvem para que os pais possam ver o que ela marca.

## Como funciona

- A Isabella entra com o **código dela** e pode marcar e escrever.
- Os pais entram com o **código dos pais** e só podem **ver** (modo somente leitura). A tela atualiza sozinha a cada 30 segundos.
- Tudo é salvo também no navegador da Isabella. Se a internet cair, ela continua usando e o planner sincroniza depois.
- Sem o Vercel configurado (por exemplo no GitHub Pages), o planner funciona normalmente só no navegador, sem códigos.

## Colocar no Vercel

1. Em vercel.com, entre com a conta do GitHub, clique em **Add New → Project** e importe `danibacelar/bella_planner`. Clique em **Deploy** (não precisa mudar nada).
2. No projeto, abra **Storage** (ou **Marketplace**) e adicione **Upstash for Redis** (plano gratuito). Conecte ao projeto. Isso cria sozinho as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
3. Em **Settings → Environment Variables**, crie duas variáveis (para Production, Preview e Development):
   - `STUDENT_CODE`: o código da Isabella.
   - `TEACHER_CODE`: o código dos pais.
   Use códigos diferentes entre si e com pelo menos 8 caracteres.
4. Em **Deployments**, faça **Redeploy** para as variáveis valerem.
5. Abra o endereço do projeto. Cada pessoa digita o código uma vez em cada aparelho.

Os códigos ficam só nas configurações do Vercel, nunca no GitHub.

## Levar o progresso que ela já tem

No endereço antigo do planner, na página inicial, use **Save a backup**. No endereço novo, entre com o código da Isabella e use **Restore a backup** na página inicial.
