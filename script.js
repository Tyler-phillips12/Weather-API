const apiKey = "363aefdd802ea74dad145c01ad39d471";
const apiUrl = "https://api.openweathermap.org/data/2.5/forecast";

// Define an array of days of the week
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatWeatherData(data) {
  const cityName = data.city.name;

  // Get the forecast data for the next 5 days
  const forecastData = data.list.filter((forecast) => {
    // We want the forecast for every 3 hours
    // So we filter the forecast data based on its time
    const time = new Date(forecast.dt * 1000);
    return time.getHours() % 7 === 0;
  });

  // Group the forecast data by day of the week
  const forecastDataByDay = {};
  forecastData.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dayOfWeek = days[date.getDay()];
    if (!forecastDataByDay[dayOfWeek]) {
      forecastDataByDay[dayOfWeek] = [];
    }
    forecastDataByDay[dayOfWeek].push(forecast);
  });

  // Format the forecast data for each day
  const formattedForecastData = Object.entries(forecastDataByDay).map(
    ([dayOfWeek, forecasts]) => {
      const temperatureList = forecasts.map((forecast) =>
        forecast.main.temp.toFixed(1)
      );
      const descriptionList = forecasts.map(
        (forecast) => forecast.weather[0].description
      );
      const iconList = forecasts.map(
        (forecast) =>
          `<img src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png">`
      );
      return `
      <div id="forecast-card" class="day-forecast">
        <h3>${dayOfWeek}</h3>
        <p><strong>Temperatures:</strong> ${temperatureList.join("°F, ")}°F</p>
        <p><strong>Descriptions:</strong> ${descriptionList.join(", ")}</p>
        <p><strong>Weather:</strong> ${iconList.join("")}</p>
      </div>
    `;
    }
  );

  // Join the formatted data for each day and return as a single string
  return `
    <div class="forecast">
      <h2>5-Day Weather Forecast for ${cityName}</h2>
      ${formattedForecastData.join("")}
    </div>
  `;
}

async function getWeatherData(city) {
  const url = `${apiUrl}?q=${city}&appid=${apiKey}&units=imperial`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const form = document.querySelector("#form");
const input = document.querySelector("#search");
const resultDiv = document.querySelector("#result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = input.value;
  try {
    const weatherData = await getWeatherData(city);
    localStorage.setItem("weatherData", JSON.stringify(weatherData));
    const formattedWeatherData = formatWeatherData(weatherData);
    resultDiv.innerHTML = formattedWeatherData;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "An error occurred while fetching the weather data.";
  }
});

// Load data from local storage on page load
window.addEventListener("load", () => {
  const weatherData = JSON.parse(localStorage.getItem("weatherData"));
  if (weatherData) {
    const formattedWeatherData = formatWeatherData(weatherData);
    resultDiv.innerHTML = formattedWeatherData;
  }
});

