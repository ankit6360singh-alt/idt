/**
 * Weather Service — OpenWeather API (free tier)
 */

import axios from 'axios'

export const getWeatherData = async (destination) => {
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey || apiKey === 'demo_key' || apiKey === 'your_openweather_key_here') {
        return getDemoWeather(destination)
    }

    try {
        const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: { q: destination, appid: apiKey, units: 'metric' },
            timeout: 6000
        })

        const d = res.data
        return {
            temperature: Math.round(d.main.temp),
            feelsLike: Math.round(d.main.feels_like),
            condition: d.weather[0].main,
            description: d.weather[0].description,
            humidity: d.main.humidity,
            windSpeed: Math.round(d.wind.speed * 3.6), // m/s → km/h
            pressure: d.main.pressure,
            visibility: Math.round((d.visibility || 10000) / 1000),
            icon: `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
            sunrise: new Date(d.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(d.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
    } catch (err) {
        console.warn('Weather API error:', err.message)
        return getDemoWeather(destination)
    }
}

const getDemoWeather = (destination) => {
    const demos = {
        default: { temperature: 28, condition: 'Partly Cloudy', humidity: 68, windSpeed: 14 },
        goa: { temperature: 31, condition: 'Sunny', humidity: 75, windSpeed: 18 },
        manali: { temperature: 12, condition: 'Clear', humidity: 45, windSpeed: 22 },
        rajasthan: { temperature: 36, condition: 'Hot & Sunny', humidity: 20, windSpeed: 10 },
        kerala: { temperature: 29, condition: 'Humid & Warm', humidity: 85, windSpeed: 12 },
        ladakh: { temperature: 8, condition: 'Cold & Clear', humidity: 25, windSpeed: 30 },
        himachal: { temperature: 15, condition: 'Cool & Pleasant', humidity: 55, windSpeed: 16 },
    }

    const key = Object.keys(demos).find(k => destination.toLowerCase().includes(k)) || 'default'
    const w = demos[key]

    return {
        ...w,
        feelsLike: w.temperature - 2,
        description: w.condition.toLowerCase(),
        pressure: 1013,
        visibility: 10,
        icon: null,
        sunrise: '6:15 AM',
        sunset: '7:45 PM',
    }
}
