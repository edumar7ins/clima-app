# Tarefas de implementacao

Este arquivo divide a implementacao definida em [prd](./prd) em etapas progressivas para execucao por agentes de IA. O PRD continua sendo a fonte de verdade para requisitos, contratos da API, regras visuais e criterios de aceite; estas tarefas apenas organizam a ordem de trabalho.

Cada tarefa deve ser concluida e validada antes do inicio da proxima.

## 1. Preparar a estrutura base da aplicacao

- [x] Remover o conteudo de demonstracao do starter do Vite e estabelecer a estrutura inicial da tela em `src/main.ts` e `src/style.css`, preservando Vite, TypeScript e JavaScript vanilla.

  **Criterio de aprovacao:** a aplicacao inicia sem erros, nao exibe o contador do starter e apresenta uma estrutura semantica com area de busca e uma area reservada para os estados da aplicacao, sem fazer requisicoes ao Open-Meteo.

  **Referencia:** PRD, RNF-01, RNF-02, RF-01, CA-01 e Observacoes e premissas.

## 2. Criar tipos e regras de dominio

- [x] Criar os tipos internos de `Location`, `CurrentWeather` e dos estados da tela (`empty`, `loading`, `success`, `no-results`), alem das funcoes puras necessarias para interpretar `weather_code` e `is_day`.

  **Criterio de aprovacao:** os tipos representam somente os dados necessarios para a interface, `is_day` e convertido para Dia/Noite, todos os grupos de codigos do PRD sao mapeados e codigos desconhecidos retornam `Condicao desconhecida` sem lancar excecao.

  **Referencia:** PRD, RF-07, RF-08, RNF-02, 5.1 e 5.3.

## 3. Implementar a busca de localizacao

- [x] Criar o modulo de servico do Open-Meteo e implementar `searchLocation(cityName)`, incluindo normalizacao da entrada, montagem segura da URL e validacao da resposta de geocodificacao.

  **Criterio de aprovacao:** a funcao usa `URLSearchParams` ou `URL`, envia `count=1`, `language=pt` e `format=json`, retorna apenas `name`, `latitude`, `longitude`, `countryCode` e `timezone` do primeiro resultado, e retorna ausencia controlada quando nao houver resultado, parametro valido ou resposta HTTP bem-sucedida.

  **Referencia:** PRD, RF-02, RF-03, RNF-02, RNF-03 e 5.2.

## 4. Implementar a busca e validacao do clima

- [x] Implementar `getCurrentWeather(location)` no mesmo modulo de servico, fazendo a segunda requisicao e normalizando `current` e `current_units` para o modelo interno.

  **Criterio de aprovacao:** a funcao envia latitude, longitude, timezone e o conjunto de parametros `current` exigido, valida `current`, `current_units` e todos os campos obrigatorios, preserva as unidades retornadas pela API e retorna ausencia controlada para resposta incompleta, invalida ou HTTP malsucedida.

  **Referencia:** PRD, RF-04, RF-05, RF-06, RNF-02, RNF-03 e 5.2.

## 5. Adicionar formulario e validacao da entrada

- [x] Implementar o formulario de busca com campo de texto, label associado, botao identificavel e envio por Enter; normalizar a cidade com `trim()` antes de iniciar o fluxo.

  **Criterio de aprovacao:** entradas vazias ou compostas apenas por espacos nao fazem requisicoes e exibem orientacao objetiva; entradas com espacos nas extremidades sao enviadas sem esses espacos; o fluxo funciona por teclado.

  **Referencia:** PRD, RF-02, 2.3, RNF-05, RF-10 e CA-08.

## 6. Orquestrar a busca encadeada e os estados

- [x] Conectar o formulario a `searchLocation` e `getCurrentWeather`, modelando explicitamente os estados vazio, carregando, sucesso e sem resultado.

  **Criterio de aprovacao:** uma busca valida faz exatamente as duas requisicoes na ordem correta; cidade nao encontrada nao chama a API climatica; qualquer falha ou dado incompleto termina em `no-results`; a busca nova nao permite que uma resposta antiga substitua uma busca mais recente.

  **Referencia:** PRD, 2.1, 2.2, RF-09, RF-10, RNF-04, 5.3, 5.4, CA-02, CA-05 e CA-06.

## 7. Implementar o estado vazio e o carregamento

- [x] Renderizar o estado vazio na abertura e o estado de carregamento durante toda a operacao encadeada, incluindo bloqueio temporario do envio.

  **Criterio de aprovacao:** a abertura nao faz chamadas de rede e orienta a pesquisa; enquanto qualquer requisicao esta em andamento, ha indicador e mensagem de carregamento, o botao/campo de envio nao inicia busca concorrente e os controles sao restaurados apos sucesso ou falha.

  **Referencia:** PRD, RF-01, RF-09, RNF-04, CA-01 e CA-07.

## 8. Renderizar o painel de sucesso

- [x] Renderizar o painel com sidebar e area principal usando somente o modelo normalizado, incluindo local, temperatura, contexto temporal e todas as metricas exigidas.

  **Criterio de aprovacao:** o resultado exibe nome da cidade, codigo do pais, temperatura, data/hora local, Dia/Noite, descricao do clima, humidade, temperatura aparente, probabilidade de precipitacao, velocidade e direcao do vento; cada valor usa sua unidade de `current_units`; uma nova busca substitui o painel anterior somente com dados completos.

  **Referencia:** PRD, RF-06, RF-07, RF-08, 6.3, 6.4, CA-03 e CA-04.

## 9. Implementar sem resultado e mensagens acessiveis

- [x] Criar a renderizacao de `no-results` para cidade inexistente, erro de rede, resposta invalida e clima incompleto, sem expor detalhes tecnicos.

  **Criterio de aprovacao:** todas as falhas previstas exibem uma mensagem objetiva e uma orientacao para nova tentativa, nunca exibem dados parciais nem stack trace, e mensagens de carregamento/erro ficam disponiveis em regiao apropriada com `aria-live`.

  **Referencia:** PRD, 2.2, RF-05, RF-10, RNF-03, RNF-05 e 6.5.

## 10. Aplicar o layout visual e a responsividade

- [x] Implementar em `src/style.css` a direcao visual do PRD: fundo cinza escuro, busca superior centralizada, painel branco destacado, sidebar, area de metricas e composicao sem cards aninhados.

  **Criterio de aprovacao:** em viewport larga sidebar e metricas ficam lado a lado dentro de painel de ate aproximadamente 800px; em viewport estreita reorganizam-se verticalmente, todos os textos permanecem legiveis e nao existe rolagem horizontal; foco e contraste sao visiveis.

  **Referencia:** PRD, RNF-05, RNF-06, 6.1 a 6.6 e CA-09.

## 11. Cobrir as regras com testes automatizados

- [x] Adicionar testes para normalizacao de entrada, montagem de URLs, interpretacao de codigos, validacao das respostas, conversao do modelo e fluxo de busca bem-sucedido ou sem resultado.

  **Criterio de aprovacao:** os testes cobrem pelo menos os casos recomendados no PRD e passam para entradas validas, vazias, cidade inexistente, falhas HTTP, resposta climatica incompleta e codigos meteorologicos mapeados e desconhecidos.

  **Referencia:** PRD, RF-03, RF-05, RF-07, RF-08, CA-02, CA-05, CA-06, CA-08 e secao 8.

## 12. Fazer a verificacao manual final

- [x] Executar a verificacao manual do MVP em desktop, mobile e somente com teclado, cobrindo estados, textos longos e todas as faixas de `weather_code`.

  **Criterio de aprovacao:** a lista da secao 8 do PRD foi verificada; o fluxo completo funciona sem mouse, o foco e visivel, loading e erros sao compreensiveis, textos longos nao quebram o layout e nao ha regressao nos criterios CA-01 a CA-10.

  **Referencia:** PRD, CA-01 a CA-10 e secao 8.
