export type Location = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type WeatherUnits = {
  temperature: string
  humidity: string
  apparentTemperature: string
  windSpeed: string
  windDirection: string
  precipitationProbability: string
}

export type CurrentWeather = {
  temperature: number
  humidity: number
  apparentTemperature: number
  isDay: boolean
  windSpeed: number
  windDirection: number
  precipitationProbability: number
  weatherCode: number
  time: string
  units: WeatherUnits
}

export type ViewState = 'empty' | 'loading' | 'success' | 'no-results'

export function normalizeCityName(value: string): string {
  return value.trim()
}

export function getWeatherDescription(weatherCode: number): string {
  const descriptions: Record<number, string> = {
    0: 'Ceu limpo',
    1: 'Parcialmente nublado',
    2: 'Parcialmente nublado',
    3: 'Parcialmente nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco intenso',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva intensa',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve intensa',
    80: 'Pancadas de chuva fracas',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva fortes',
    95: 'Tempestade leve ou moderada',
    96: 'Tempestade com granizo',
    99: 'Tempestade com granizo',
  }

  return descriptions[weatherCode] ?? 'Condicao desconhecida'
}

export function getDayPhaseLabel(isDay: boolean): string {
  return isDay ? 'Dia' : 'Noite'
}

export function formatLocalDateTime(time: string): string {
  if (!time) {
    return 'Data indisponivel'
  }

  const normalizedTime = time.includes('T') ? time : `${time.slice(0, 10)}T${time.slice(11) ?? '00:00'}`
  const parsed = new Date(`${normalizedTime}:00`)

  if (Number.isNaN(parsed.getTime())) {
    return 'Data indisponivel'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}
