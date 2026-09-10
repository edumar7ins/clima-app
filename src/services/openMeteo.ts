import type { CurrentWeather, Location } from '../domain'

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export type GeocodingResponse = {
  results?: Array<{
    name?: string
    latitude?: number
    longitude?: number
    country_code?: string
    timezone?: string
  }>
}

export type WeatherResponse = {
  current?: {
    temperature_2m?: number
    relative_humidity_2m?: number
    apparent_temperature?: number
    is_day?: number
    wind_speed_10m?: number
    wind_direction_10m?: number
    precipitation_probability?: number
    weather_code?: number
    time?: string
  }
  current_units?: {
    temperature_2m?: string
    relative_humidity_2m?: string
    apparent_temperature?: string
    wind_speed_10m?: string
    wind_direction_10m?: string
    precipitation_probability?: string
  }
}

export async function searchLocation(cityName: string): Promise<Location | null> {
  const normalizedName = cityName.trim()

  if (!normalizedName) {
    return null
  }

  const params = new URLSearchParams({
    name: normalizedName,
    count: '1',
    language: 'pt',
    format: 'json',
  })

  let response: Response

  try {
    response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`)
  } catch {
    return null
  }

  if (!response.ok) {
    return null
  }

  let payload: GeocodingResponse

  try {
    payload = (await response.json()) as GeocodingResponse
  } catch {
    return null
  }

  const result = payload.results?.[0]

  if (!result || !result.name || typeof result.latitude !== 'number' ||
      !Number.isFinite(result.latitude) || typeof result.longitude !== 'number' ||
      !Number.isFinite(result.longitude) || !result.country_code || !result.timezone) {
    return null
  }

  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    countryCode: result.country_code,
    timezone: result.timezone,
  }
}

export async function getCurrentWeather(location: Location): Promise<CurrentWeather | null> {
  if (!location.timezone || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return null
  }

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone,
    current:
      'precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,wind_direction_10m,weather_code',
  })

  let response: Response

  try {
    response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`)
  } catch {
    return null
  }

  if (!response.ok) {
    return null
  }

  let payload: WeatherResponse

  try {
    payload = (await response.json()) as WeatherResponse
  } catch {
    return null
  }

  if (!payload.current || !payload.current_units) {
    return null
  }

  const current = payload.current
  const units = payload.current_units

  const requiredCurrentValues = {
    temperature_2m: current.temperature_2m,
    relative_humidity_2m: current.relative_humidity_2m,
    apparent_temperature: current.apparent_temperature,
    is_day: current.is_day,
    wind_speed_10m: current.wind_speed_10m,
    wind_direction_10m: current.wind_direction_10m,
    precipitation_probability: current.precipitation_probability,
    weather_code: current.weather_code,
  }

  if (Object.values(requiredCurrentValues).some((value) => value === undefined || value === null || Number.isNaN(Number(value))) ||
      !Number.isFinite(Number(current.temperature_2m)) || !Number.isFinite(Number(current.relative_humidity_2m)) ||
      !Number.isFinite(Number(current.apparent_temperature)) || !Number.isFinite(Number(current.wind_speed_10m)) ||
      !Number.isFinite(Number(current.wind_direction_10m)) || !Number.isFinite(Number(current.precipitation_probability)) ||
      !Number.isFinite(Number(current.weather_code)) || (current.is_day !== 0 && current.is_day !== 1) ||
      typeof current.time !== 'string' || !current.time) {
    return null
  }

  const requiredUnits = {
    temperature: units.temperature_2m,
    humidity: units.relative_humidity_2m,
    apparentTemperature: units.apparent_temperature,
    windSpeed: units.wind_speed_10m,
    windDirection: units.wind_direction_10m,
    precipitationProbability: units.precipitation_probability,
  }

  if (Object.values(requiredUnits).some((value) => typeof value !== 'string' || value.trim().length === 0)) {
    return null
  }

  return {
    temperature: Number(current.temperature_2m),
    humidity: Number(current.relative_humidity_2m),
    apparentTemperature: Number(current.apparent_temperature),
    isDay: Number(current.is_day) === 1,
    windSpeed: Number(current.wind_speed_10m),
    windDirection: Number(current.wind_direction_10m),
    precipitationProbability: Number(current.precipitation_probability),
    weatherCode: Number(current.weather_code),
    time: String(current.time),
    units: {
      temperature: units.temperature_2m ?? '',
      humidity: units.relative_humidity_2m ?? '',
      apparentTemperature: units.apparent_temperature ?? '',
      windSpeed: units.wind_speed_10m ?? '',
      windDirection: units.wind_direction_10m ?? '',
      precipitationProbability: units.precipitation_probability ?? '',
    },
  }
}
