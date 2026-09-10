import './style.css'
import {
  formatLocalDateTime,
  getDayPhaseLabel,
  getWeatherDescription,
  normalizeCityName,
  type CurrentWeather,
  type Location,
  type ViewState,
} from './domain'
import { getCurrentWeather, searchLocation } from './services/openMeteo'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('Root element #app not found')
}

const app = appElement

let currentState: ViewState = 'empty'
let currentWeather: CurrentWeather | null = null
let currentLocation: Location | null = null
let latestRequestId = 0

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character] ?? character
  })
}

function render(): void {
  const searchDisabled = currentState === 'loading'

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar" aria-label="Busca de clima">
        <form id="search-form" class="search-form" novalidate>
          <label for="city-input" class="sr-only">Nome da cidade</label>
          <input
            id="city-input"
            name="city"
            type="text"
            autocomplete="off"
            placeholder="Digite uma cidade"
            aria-label="Nome da cidade"
            aria-invalid="false"
            ${searchDisabled ? 'disabled' : ''}
          />
          <button type="submit" ${searchDisabled ? 'disabled' : ''}>Buscar</button>
        </form>
      </header>

      <main class="content" aria-live="polite">
        ${renderContent()}
      </main>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#search-form')
  const input = document.querySelector<HTMLInputElement>('#city-input')

  if (form && input) {
    input.focus()
    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const city = normalizeCityName(input.value)

      if (!city) {
        currentState = 'no-results'
        currentWeather = null
        currentLocation = null
        render()
        const message = document.querySelector<HTMLElement>('[data-status-message]')
        if (message) {
          message.textContent = 'Informe uma cidade para consultar o clima.'
        }
        return
      }

      await handleSearch(city)
    })
  }
}

function renderContent(): string {
  switch (currentState) {
    case 'loading':
      return `
        <section class="state state-loading" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <p>Buscando cidade e clima...</p>
        </section>
      `
    case 'success':
      if (!currentWeather || !currentLocation) {
        return renderNoResults('Não foi possível mostrar o clima solicitado.')
      }

      const safeCity = escapeHtml(currentLocation.name)
      const safeCountry = escapeHtml(currentLocation.countryCode)
      const safeTemperature = escapeHtml(`${currentWeather.temperature}${currentWeather.units.temperature}`)
      const safeTime = escapeHtml(formatLocalDateTime(currentWeather.time, currentLocation.timezone))
      const safeDescription = escapeHtml(getWeatherDescription(currentWeather.weatherCode))
      const safeHumidity = escapeHtml(`${currentWeather.humidity}${currentWeather.units.humidity}`)
      const safeApparent = escapeHtml(`${currentWeather.apparentTemperature}${currentWeather.units.apparentTemperature}`)
      const safePrecipitation = escapeHtml(`${currentWeather.precipitationProbability}${currentWeather.units.precipitationProbability}`)
      const safeWindSpeed = escapeHtml(`${currentWeather.windSpeed}${currentWeather.units.windSpeed}`)
      const safeWindDirection = escapeHtml(`${currentWeather.windDirection}${currentWeather.units.windDirection}`)

      return `
        <section class="weather-panel" aria-label="Resultado do clima atual">
          <aside class="weather-sidebar">
            <div class="temperature-row">
              <span class="temperature">${safeTemperature}</span>
              <span class="day-tag">${getDayPhaseLabel(currentWeather.isDay)}</span>
            </div>
            <div class="location-block">
              <h1>${safeCity}</h1>
              <p>${safeCountry}</p>
            </div>
            <p class="time-reference">${safeTime}</p>
            <p class="weather-description">${safeDescription}</p>
          </aside>

          <section class="metrics" aria-label="Métricas climáticas">
            <div class="metric">
              <span class="label">Humidade</span>
              <strong>${safeHumidity}</strong>
            </div>
            <div class="metric">
              <span class="label">Temperatura aparente</span>
              <strong>${safeApparent}</strong>
            </div>
            <div class="metric">
              <span class="label">Probabilidade de precipitação</span>
              <strong>${safePrecipitation}</strong>
            </div>
            <div class="metric">
              <span class="label">Velocidade do vento</span>
              <strong>${safeWindSpeed}</strong>
            </div>
            <div class="metric">
              <span class="label">Direção do vento</span>
              <strong>${safeWindDirection}</strong>
            </div>
          </section>
        </section>
      `
    case 'no-results':
      return renderNoResults('Não encontramos uma cidade com esse nome ou os dados climáticos não puderam ser carregados.')
    case 'empty':
    default:
      return `
        <section class="state state-empty" aria-live="polite">
          <h2>Consulta do clima</h2>
          <p data-status-message>Pesquise uma cidade para ver as condições atuais.</p>
        </section>
      `
  }
}

function renderNoResults(message: string): string {
  const safeMessage = escapeHtml(message)

  return `
    <section class="state state-empty" aria-live="polite">
      <h2>Sem resultados</h2>
      <p data-status-message>${safeMessage}</p>
      <p class="subtext">Tente outra cidade ou verifique a digitação.</p>
    </section>
  `
}

async function handleSearch(city: string): Promise<void> {
  const requestId = ++latestRequestId
  currentState = 'loading'
  currentWeather = null
  currentLocation = null
  render()

  try {
    const location = await searchLocation(city)

    if (requestId !== latestRequestId) {
      return
    }

    if (!location) {
      currentState = 'no-results'
      render()
      return
    }

    const weather = await getCurrentWeather(location)

    if (requestId !== latestRequestId) {
      return
    }

    if (!weather) {
      currentState = 'no-results'
      currentLocation = null
      currentWeather = null
      render()
      return
    }

    currentLocation = location
    currentWeather = weather
    currentState = 'success'
    render()
  } catch {
    if (requestId !== latestRequestId) {
      return
    }

    currentState = 'no-results'
    currentWeather = null
    currentLocation = null
    render()
  }
}

render()
