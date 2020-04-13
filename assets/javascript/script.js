function initPage() {
    // Target HTML Elements
    const $inputEl = document.getElementById("city-input");
    const $searchEl = document.getElementById("search-button");
    const $clearEl = document.getElementById("clear-history");
    const $nameEl = document.getElementById("city-name");
    const $currentPicEl = document.getElementById("current-pic");
    const $currentTempEl = document.getElementById("temperature");
    const $currentHumidityEl = document.getElementById("humidity");
    const $currentWindEl = document.getElementById("wind-speed");
    const $currentUVEl = document.getElementById("UV-index");
    const $historyEl = document.getElementById("history");
    
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);
    
    const APIKey = "0889b515e7870abc983afdf32bd83ed9";

    // Display Weather based on City Input
    function displayWeather(cityName) {
        // Open Weather API Request Call
        const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${APIKey}`;
        
        axios.get(queryURL)
        .then(response => {
            console.log(response);

            // Display Current Date using Moment.js
            const currentDate = moment().format('L');
            $nameEl.innerHTML = `${response.data.name} (${currentDate})`;

            // Display Weather Image
            const weatherImage = response.data.weather[0].icon;
            $currentPicEl.setAttribute("src",`https://openweathermap.org/img/wn/${weatherImage}@2x.png`);
            $currentPicEl.setAttribute("alt", response.data.weather[0].description);
            
            // Display Temperature (Fahrenheit), Humidity, and Wind Speed
            $currentTempEl.innerHTML = `Temperature: ${(response.data.main.temp)}&#176F`;
            $currentHumidityEl.innerHTML = `Humidity: ${response.data.main.humidity}%`;
            $currentWindEl.innerHTML = `Wind Speed: ${response.data.wind.speed}MPH`;

        // UV Index    
        const latitude = response.data.coord.lat;
        const longitude = response.data.coord.lon;
        const UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKey}&cnt=1`;
        
        axios.get(UVQueryURL)
        .then(response => {
            // Display Current UV Index

            const UVIndex = document.createElement("span");
            const UVIndexValue = response.data[0].value;

            if (UVIndexValue <= 3) {
                UVIndex.setAttribute("style", "background-color: green");
            }
            else if (UVIndexValue >= 3 || UVIndexValue <= 6) {
                UVIndex.setAttribute("style", "background-color: yellow");
            }
            else if (UVIndexValue >= 6 || UVIndexValue <= 8) {
                UVIndex.setAttribute("style", "background-color: orange");
            }
            else {
                UVIndex.setAttribute("style", "background-color: red");
            }

            UVIndex.innerHTML = UVIndexValue;
            $currentUVEl.innerHTML = "UV Index: ";
            $currentUVEl.append(UVIndex);
        });

        // 5-Day Forecast
        const cityID = response.data.id;
        const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&units=imperial&appid=${APIKey}`;
        
        axios.get(forecastQueryURL)
        .then(response => {
            // Display 5-Day Forecast under Current Conditions
            console.log(response);

            const forecastEls = document.querySelectorAll(".forecast");

            for (let i = 0; i < forecastEls.length; i++) {
                // Forecast - Display Current Date
                forecastEls[i].innerHTML = "";
                const forecastIndex = i * 8 + 4;
                const forecastDate = moment(response.data.list[forecastIndex].dt * 1000).format("L");
                const forecastDateEl = document.createElement("p");

                forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                forecastDateEl.innerHTML = forecastDate;
                forecastEls[i].append(forecastDateEl);

                // Forecast - Display Weather Image
                const forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src", `https://openweathermap.org/img/wn/${response.data.list[forecastIndex].weather[0].icon}@2x.png`);
                forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                forecastEls[i].append(forecastWeatherEl);

                // Forecast - Display Temperature (Fahrenheit) 
                const forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = `Temp: ${(response.data.list[forecastIndex].main.temp)}&#176F`;
                forecastEls[i].append(forecastTempEl);

                // Forecast - Display Humidity 
                const forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = `Humidity: ${response.data.list[forecastIndex].main.humidity}%`;
                forecastEls[i].append(forecastHumidityEl);
                }
            })
        });  
    }

    // Search Button - Event Listener
    $searchEl.addEventListener("click", () => {
        const searchTerm = $inputEl.value;
        displayWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    // Clear Button - Event Listener
    $clearEl.addEventListener("click", () => {
        searchHistory = [];
        renderSearchHistory();
    })

    // Previous Searched Cities
    function renderSearchHistory() {
        $historyEl.innerHTML = "";

        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", () => {
                displayWeather(historyItem.value);
            })
            $historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        displayWeather(searchHistory[searchHistory.length - 1]);
    }

    // Enter Key
    $(document).keyup(event => { 
    event.preventDefault();
    if (event.keyCode === 13) { 
        $searchEl.click(); 
    } 
}); 

}
initPage();
