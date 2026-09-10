# Projeto: Clima

Este projeto vai pegar a cidade e baseado nisso, consultar o clima daquela região, exibindo as principais informações de clima, temperatuera humidade e etc.

### Aspectos Técnicos

O projeto vai ser feito em Vite + Vanilla + TypeScript.

### Informações da API que será usada no projeto:
Ele vai usar a API OpneMeteo, com os seguintes endpoints:


#### Para pegar a latitude e longitude da cidade, basado no nome da cidade, vamos usar:
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE} = Nome da cidade que o ususário digitou.

Exemplo de resposta:
{
  "results": [
    {
    id	2742611
    name	"Aveiro"
    latitude	40.64575
    longitude	-8.64643
    elevation	19.0JS:19
    feature_code	"PPLA"
    country_code	"PT"
    admin1_id	2742610
    admin2_id	8010417
    admin3_id	12572879
    timezone	"Europe/Lisbon"
    population	80880
    country_id	2264397
    country	"Portugal"
    admin1	"Distrito de Aveiro"
    admin2	"Aveiro"
    admin3	"União das freguesias de Glória e Vera Cruz"
}
],
"generationtime_ms"	0.56135654
}

Informações que PRECISAMOS:
- name
- latitude
- longitude
- conutry_code
- timezone

#### Para pegar as informações de clima:
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&hourly=temperature_2m&current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,wind_direction_10m,weather_code&timezone={TIMEZONE}

{LATITUDE} = Latitude
{LONGITUDE} = Longitude
{TIMEZONE} = Timezone

Exemplo de resposta:

latitude	52.52
longitude	13.419998
generationtime_ms	0.35774707794189453
utc_offset_seconds	3600
timezone	"Europe/London"
timezone_abbreviation	"GMT+1"
elevation	38.0JS:38
current_units	
time	"iso8601"
interval	"seconds"
precipitation_probability	"%"
temperature_2m	"°C"
relative_humidity_2m	"%"
apparent_temperature	"°C"
is_day	""
precipitation	"mm"
wind_speed_10m	"km/h"
wind_direction_10m	"°"
weather_code	"wmo code"
current	
time	"2026-09-09T10:15"
interval	900
precipitation_probability	0
temperature_2m	18.4
relative_humidity_2m	60
apparent_temperature	16.3
is_day	1
precipitation	0.00JS:0
wind_speed_10m	15.5
wind_direction_10m	283
weather_code	3

Informações que PRECISAMOS da resposta:
Na resposta eu tenho intens:
- current_units tem as unidades de medida das propriedades
- current tem os valores das propriedades

Propriedades obrigatórias:
- temperature_2m
- relative_humidity_2m
- apparent_temperature
- is_day
- wind_speed_10m
- wind_direction_10m
- precipitation_probability


#### Informação importante:
Teremos um aquivo com as funções do OpenMeteo, para que o projeto não faça requisição direta para a API mas sim use as funções desse arquivo.

Fluxo de pesquisa para receber o nome da cidade e pegar as infomações de clima:
- O usuário digita o nome da cidade
- O projeto pega o nome e usa o OpenMeteo para pegar a latitude, longitude e timezone dessa cidade.
- Aoo pegar a latitude, longitude e timezone, o projeto usa essas informações para fazer a requisição e pegar as informações do clima dessa localização.
- Caso não ache as informações da cidade, se comportar com se não tivesse achado nada.
- Caso ache as informações da cidade mas não as de clima, se comportar como se não tivesse achado nada.

A busca envolve as 2 requisições (buscar latitude/longitude + buscar clima), mas para o usuário é uma só, com loading.

As funções do OpenMeteo devem verificar se os parâmetros vieram, caso contrário, age como se não tivesse vindo.


### Apectos Visuais (Design e UX)

Tem que ter Empty State.

Teremos uma área SUPERIOR centralizada que tem apenas o campo de busca da cidade.

O projeto terá um sidebar na esquerda com as seguintes informações:

- Temperatura
- Nome da cidade, Código do país
- Dia atual
- Se é dia ou noite (baseado no is_day)
- Weather Code

Na área principal:
- Humidade relativa
- Temperatura aparente
- Probabilidade de precipitação
- Velocidade/Direção do vento

Design geral:

- O projeto terá um fundo cinza escuro
- A parte superior não terá background, mas tanto sidewbar quanto a área principal ficarão dentro de uma div com borda bem arredondada, fundo branco, centralizada e largura máxima de 800px

informaçẽos de interpretação sobre o Weather Code:
0: Clear sky1, 2, 3: Partly cloudy, changing, or overcast45, 48: Fog and depositing rime fog51, 53, 55: Light, moderate, or dense drizzle61, 63, 65: Slight, moderate, or heavy rain71, 73, 75: Slight, moderate, or heavy snow fall80, 81, 82: Slight, moderate, or violent rain showers95: Slight or moderate thunderstorm96, 99: Thunderstorm with slight or heavy hail [1] (https://github.com/meshosk/weather-icons)


