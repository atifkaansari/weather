const url = 'https://api.openweathermap.org/data/2.5/';
const key = "BURAYA_KENDİ_API_KEYİNİ_YAZ";

// Arama fonksiyonu (buton ve enter için)
function searchWeather(cityName) {
    let city;
    if (cityName) {
        city = cityName;
        document.getElementById('cityInput').value = cityName;
    } else {
        city = document.getElementById('cityInput').value.trim();
    }
    if (city === "") {
        alert("Şehir adı boş bırakılamaz");
        return;
    }
    let weatherQuery = `${url}weather?q=${city}&appid=${key}&units=metric&lang=tr`;
    let forecastQuery = `${url}forecast?q=${city}&appid=${key}&units=metric&lang=tr`;
    // Güncel hava durumu
    fetch(weatherQuery)
        .then(weather => weather.json())
        .then(displayResult)
        .catch(() => alert("Şehir bulunamadı!"));
    // 5 günlük tahmin
    fetch(forecastQuery)
        .then(res => res.json())
        .then(displayForecast)
        .catch(() => {
            document.getElementById('forecastContainer').innerHTML = '<div class="text-danger">Tahmin verisi alınamadı.</div>';
        });
}

// Enter tuşu ile arama
document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Sonuçları ekrana yazdırma
function displayResult(result) {
    if (!result || result.cod !== 200) {
        alert("Şehir bulunamadı!");
        return;
    }
    // Hava durumuna göre arkaplan değiştir
    document.body.classList.remove('bg-clear', 'bg-partlycloudy', 'bg-clouds', 'bg-rain', 'bg-snow', 'bg-thunderstorm', 'bg-mist');
    removeWeatherEffects();
    const icon = result.weather[0].icon;
    // Ana karttaki ikonun dinamik olarak değişmesi
    let iconHtml = '<i class="fas fa-question weather-icon"></i>';
    if (icon.startsWith('01')) { // Güneşli
        iconHtml = '<i class="fas fa-sun weather-icon text-warning"></i>';
        document.body.classList.add('bg-clear');
    } else if (icon.startsWith('02')) { // Parçalı bulutlu
        iconHtml = '<i class="fas fa-cloud-sun weather-icon text-warning"></i>';
        document.body.classList.add('bg-partlycloudy');
    } else if (icon.startsWith('03') || icon.startsWith('04')) { // Bulutlu/kapalı
        iconHtml = '<i class="fas fa-cloud weather-icon text-secondary"></i>';
        document.body.classList.add('bg-clouds');
    } else if (icon.startsWith('09') || icon.startsWith('10')) { // Yağmur
        iconHtml = '<i class="fas fa-cloud-rain weather-icon text-primary"></i>';
        document.body.classList.add('bg-rain');
        setTimeout(addRainEffect, 100);
    } else if (icon.startsWith('11')) { // Fırtına
        iconHtml = '<i class="fas fa-bolt weather-icon text-warning"></i>';
        document.body.classList.add('bg-thunderstorm');
    } else if (icon.startsWith('13')) { // Kar
        iconHtml = '<i class="fas fa-snowflake weather-icon text-info"></i>';
        document.body.classList.add('bg-snow');
        setTimeout(addSnowEffect, 100);
    } else if (icon.startsWith('50')) { // Sis/duman
        iconHtml = '<i class="fas fa-smog weather-icon text-muted"></i>';
        document.body.classList.add('bg-mist');
    }
    document.querySelector('.weather-icon').outerHTML = iconHtml;
    document.getElementById('cityName').innerText = `${result.name}, ${result.sys.country}`;
    document.getElementById('currentTemp').innerText = `${Math.round(result.main.temp)}°C`;
    document.getElementById('weatherDesc').innerText = result.weather[0].description.toUpperCase();
    // Görüş mesafesi kontrolü
    let visibilityText = '--';
    if (typeof result.visibility === 'number' && result.visibility < 10000) {
        visibilityText = `${(result.visibility / 1000).toFixed(1)} km`;
    }
    document.getElementById('visibility').innerText = visibilityText;
    // document.getElementById('humidity').innerText = `${result.main.humidity}%`;
    document.getElementById('windSpeed').innerText = `${Math.round(result.wind.speed * 3.6)} km/h`;
    document.getElementById('feelsLike').innerText = `${Math.round(result.main.feels_like)}°C`;
    const date = new Date(result.dt * 1000);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = date.toLocaleDateString('tr-TR', options);
}

function addSnowEffect() {
    removeWeatherEffects();
    const snow = document.createElement('div');
    snow.className = 'snow-effect';
    snow.style.zIndex = '2147483647';
    for (let i = 0; i < 40; i++) {
        const flake = document.createElement('span');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDelay = (Math.random() * 6) + 's';
        flake.style.fontSize = (Math.random() * 16 + 12) + 'px';
        flake.innerHTML = '❄';
        snow.appendChild(flake);
    }
    document.body.appendChild(snow);
}

function addRainEffect() {
    removeWeatherEffects();
    const rain = document.createElement('div');
    rain.className = 'rain-effect';
    rain.style.zIndex = '2147483647';
    for (let i = 0; i < 60; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDelay = (Math.random() * 1.2) + 's';
        rain.appendChild(drop);
    }
    document.body.appendChild(rain);
}

function removeWeatherEffects() {
    document.querySelectorAll('.snow-effect, .rain-effect').forEach(e => e.remove());
}

function displayForecast(data) {
    if (!data || data.cod !== "200") {
        document.getElementById('forecastContainer').innerHTML = '<div class="text-danger">Tahmin verisi alınamadı.</div>';
        document.getElementById('hourlyForecastContainer').innerHTML = '';
        return;
    }
    // Tüm saatlik tahminler (bugün ve yarın dahil)
    let hourlyHtml = '';
    data.list.forEach(item => {
        const dt = new Date(item.dt_txt);
        const hour = dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const icon = item.weather[0].icon;
        let iconHtml = '<i class="fas fa-question text-secondary" style="font-size: 1.5rem;"></i>';
        if (icon.startsWith('01')) iconHtml = '<i class="fas fa-sun text-warning" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('02') || icon.startsWith('03')) iconHtml = '<i class="fas fa-cloud-sun text-warning" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('04')) iconHtml = '<i class="fas fa-cloud text-secondary" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('09') || icon.startsWith('10')) iconHtml = '<i class="fas fa-cloud-rain text-primary" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('11')) iconHtml = '<i class="fas fa-bolt text-warning" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('13')) iconHtml = '<i class="fas fa-snowflake text-info" style="font-size: 1.5rem;"></i>';
        else if (icon.startsWith('50')) iconHtml = '<i class="fas fa-smog text-muted" style="font-size: 1.5rem;"></i>';
        hourlyHtml += `
                <div class="col-auto mb-2">
                    <div class="forecast-card p-2 text-center" style="min-width:90px;">
                        <div>${hour}</div>
                        ${iconHtml}
                        <div><strong>${Math.round(item.main.temp)}°</strong></div>
                        <small class="text-muted">${item.weather[0].description.toUpperCase()}</small>
                    </div>
                </div>
                `;
    });
    document.getElementById('hourlyForecastContainer').innerHTML = hourlyHtml;

    const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    const selected = daily.slice(0, 5);
    const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    let html = '';
    for (let i = 0; i < 5; i++) {
        const item = selected[i];
        let iconHtml = '<i class="fas fa-question text-secondary" style="font-size: 2rem;"></i>';
        let tempMax = '--';
        let tempMin = '--';
        let desc = '';
        if (item) {
            const icon = item.weather[0].icon;
            desc = item.weather[0].description;
            tempMax = Math.round(item.main.temp_max);
            tempMin = Math.round(item.main.temp_min);
            if (icon.startsWith('01')) iconHtml = '<i class="fas fa-sun text-warning" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('02') || icon.startsWith('03')) iconHtml = '<i class="fas fa-cloud-sun text-warning" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('04')) iconHtml = '<i class="fas fa-cloud text-secondary" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('09') || icon.startsWith('10')) iconHtml = '<i class="fas fa-cloud-rain text-primary" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('11')) iconHtml = '<i class="fas fa-bolt text-warning" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('13')) iconHtml = '<i class="fas fa-snowflake text-info" style="font-size: 2rem;"></i>';
            else if (icon.startsWith('50')) iconHtml = '<i class="fas fa-smog text-muted" style="font-size: 2rem;"></i>';
        }
        html += `
                <div class="col-md-2 col-6 mb-3">
                    <div class="forecast-card p-3 text-center">
                        <h6 class="mb-2">${gunler[i]}</h6>
                        ${iconHtml}
                        <div class="mt-2">
                            <strong>${tempMax}°</strong>
                            <small class="text-muted d-block">${tempMin}°</small>
                        </div>
                        <small class="text-muted">${desc}</small>
                    </div>
                </div>
                `;
    }
    document.getElementById('forecastContainer').innerHTML = html;
}



// Kullanıcının konumunu alıp otomatik hava durumu gösterme
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Tarayıcınız konum bilgisini desteklemiyor.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetch(`${url}weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=tr`)
        .then(response => response.json())
        .then(displayResult);
    fetch(`${url}forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=tr`)
        .then(response => response.json())
        .then(displayForecast);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Kullanıcı konum iznini reddetti. İstanbul gösteriliyor.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Konum bilgisi kullanılamıyor. İstanbul gösteriliyor.");
            break;
        case error.TIMEOUT:
            alert("Konum isteği zaman aşımına uğradı. İstanbul gösteriliyor.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Bilinmeyen bir hata oluştu. İstanbul gösteriliyor.");
            break;
    }
    // Default olarak İstanbul'u getir
    searchWeather('İstanbul');
}
getLocation();