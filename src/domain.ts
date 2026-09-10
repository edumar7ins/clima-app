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

export function formatLocalDateTime(time: string, timezone: string): string {
  const match = time.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)

  if (!match) {
    return 'Data indisponivel'
  }

  try {
    const [, year, month, day, hour, minute, second = '00'] = match
    const localTimestamp = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    const timezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    const parts = Object.fromEntries(
      timezoneFormatter.formatToParts(new Date(localTimestamp))
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, value]),
    )
    const timezoneTimestamp = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    )
    const adjustedTimestamp = new Date(localTimestamp - (timezoneTimestamp - localTimestamp))

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(adjustedTimestamp)
  } catch {
    return 'Data indisponivel'
  }
}
