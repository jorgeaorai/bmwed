# Bianca & Mathew — convite digital

Convite em React para 16 de abril de 2027. Identidade marfim, rosa suave, azul claro e verde oliva, com cisnes e jardim em aquarela.

## Informações do casamento
Edite `src/config.js` para trocar nomes, data, endereço, horário, traje e prazo de confirmação. O horário e endereço atuais são exemplos autorizados. Ao definir os dados reais, altere `detailsAreExamples` para `false`.

## Rodar localmente
Requer Node 22 ou superior (com suporte a `node:sqlite`).

```
npm install
npm run dev
```

O preview cria um banco SQLite local em `.preview/`, que não é publicado. A hospedagem usa Cloudflare D1 com binding `DB`; execute as migrations de `drizzle/` no seu banco se hospedar em outra plataforma. `npm run build` compila o React e gera um Worker autossuficiente em `dist/server/index.js`. Todos os assets ficam incorporados no Worker, sem dependências de CDN.

## Confirmações de presença
`POST /api/rsvp` grava nome, presença, quantidade e nomes dos acompanhantes e mensagem. Uma chave aleatória salva apenas no navegador permite atualizar a mesma resposta. As chaves de atualização são armazenadas no banco somente como hashes SHA-256.

A área `/#lista` consulta respostas e exporta CSV. A API `GET /api/rsvps` exige a identidade do proprietário fornecida pela hospedagem; a autorização está em `worker/api.mjs`. Para hospedagem externa, substitua essa checagem por autenticação confiável do seu provedor, sem aceitar cabeçalhos enviados livremente pelos visitantes.

O site mantém o acesso privado do projeto original. Para distribuição aos convidados, configure o público na plataforma quando quiser compartilhar.

## Verificação
`npm test` verifica validação, acompanhantes, origem, gravação, atualização por chave, acesso à lista e falha no banco. `npm run db:generate` cria novas migrations após alterações no schema.

## Arte e interação
Aquarela criada a partir da identidade enviada. Tipografia cursiva, envelope com lacre, abertura animada, cenas com rolagem e versão com movimento reduzido. Save the date exporta evento de dia inteiro em `.ics`, sem fixar o horário provisório.
