// WMO weather interpretation codes (Open-Meteo) -> Polish description + emoji.
var weatherInfo = function(code, isDay) {
    var weatherCodes = {
        0: { text: "bezchmurnie", icon: isDay ? "☀️" : "🌙" },
        1: { text: "przeważnie pogodnie", icon: isDay ? "🌤️" : "🌙" },
        2: { text: "częściowe zachmurzenie", icon: isDay ? "⛅" : "☁️" },
        3: { text: "pochmurno", icon: "☁️" },
        45: { text: "mgła", icon: "🌫️" },
        48: { text: "mgła osadzająca szadź", icon: "🌫️" },
        51: { text: "lekka mżawka", icon: "🌦️" },
        53: { text: "mżawka", icon: "🌦️" },
        55: { text: "gęsta mżawka", icon: "🌧️" },
        56: { text: "lekka marznąca mżawka", icon: "🌧️" },
        57: { text: "gęsta marznąca mżawka", icon: "🌧️" },
        61: { text: "słaby deszcz", icon: "🌧️" },
        63: { text: "umiarkowany deszcz", icon: "🌧️" },
        65: { text: "silny deszcz", icon: "🌧️" },
        66: { text: "słaby marznący deszcz", icon: "🌧️" },
        67: { text: "silny marznący deszcz", icon: "🌧️" },
        71: { text: "słabe opady śniegu", icon: "🌨️" },
        73: { text: "umiarkowane opady śniegu", icon: "🌨️" },
        75: { text: "intensywne opady śniegu", icon: "❄️" },
        77: { text: "ziarna śniegu", icon: "🌨️" },
        80: { text: "przelotny deszcz", icon: "🌦️" },
        81: { text: "przelotne opady deszczu", icon: "🌧️" },
        82: { text: "gwałtowna ulewa", icon: "🌧️" },
        85: { text: "przelotny śnieg", icon: "🌨️" },
        86: { text: "intensywny przelotny śnieg", icon: "❄️" },
        95: { text: "burza", icon: "⛈️" },
        96: { text: "burza z drobnym gradem", icon: "⛈️" },
        99: { text: "burza z silnym gradem", icon: "⛈️" }
    };

    if (weatherCodes[code]) {
        return weatherCodes[code];
    } else {
        return { text: "brak danych", icon: "❔" };
    }
};
