# Clima

Aplicacao web para consultar as condicoes climaticas atuais de uma cidade. O usuario informa o nome do local e recebe temperatura, descricao do tempo, umidade, temperatura aparente, probabilidade de precipitacao e dados do vento.

## Demo

https://edumar7ins.github.io/clima-app/

## Tecnologias

- TypeScript
- Vite
- Open-Meteo Geocoding API
- Open-Meteo Weather API
- GitHub Actions e GitHub Pages

## Como executar

Instale as dependencias e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Para gerar a versao de producao:

```bash
npm run build
```

O resultado sera gerado na pasta `dist`.

## Deploy

O workflow em `.github/workflows/deploy.yml` executa automaticamente quando ha um push na branch `main`. Ele instala as dependencias, gera o build e publica a pasta `dist` no GitHub Pages.

## Historico resumido

- **Fase 1:** criacao da estrutura inicial do projeto, interface de consulta, tipos de dominio, integracao com as APIs da Open-Meteo e configuracao do Vite.
- **Fase 2:** aprimoramento da validacao das respostas, normalizacao dos dados meteorologicos, descricoes das condicoes climaticas e tratamento de estados sem resultado.
- **Deploy:** configuracao do GitHub Actions para publicar automaticamente a aplicacao no GitHub Pages a cada alteracao na branch `main`.