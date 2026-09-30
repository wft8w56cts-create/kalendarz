function easterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

// Calendar-day arithmetic; adding milliseconds would break across the DST switch.
function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function getPolishHolidays(date) {
    var year = date.getFullYear();
    var easter = easterSunday(year);
    var holidays = [
        { name: "Nowy Rok", free: true, date: new Date(year, 0, 1) },
        { name: "Trzech Króli", free: true, date: new Date(year, 0, 6) },
        { name: "Święto Pracy", free: true, date: new Date(year, 4, 1) },
        { name: "Święto Konstytucji 3 Maja", free: true, date: new Date(year, 4, 3) },
        { name: "Wniebowzięcie NMP", free: true, date: new Date(year, 7, 15) },
        { name: "Wszystkich Świętych", free: true, date: new Date(year, 10, 1) },
        { name: "Narodowe Święto Niepodległości", free: true, date: new Date(year, 10, 11) },
        { name: "Wigilia Bożego Narodzenia", free: true, date: new Date(year, 11, 24) },
        { name: "Boże Narodzenie", free: true, date: new Date(year, 11, 25) },
        { name: "Drugi dzień Bożego Narodzenia", free: true, date: new Date(year, 11, 26) },
        { name: "Wielkanoc", free: true, date: easter },
        { name: "Poniedziałek Wielkanocny", free: true, date: addDays(easter, 1) },
        { name: "Zielone Świątki", free: true, date: addDays(easter, 49) },
        { name: "Boże Ciało", free: true, date: addDays(easter, 60) },
        { name: "Tłusty Czwartek", free: false, date: addDays(easter, -52) },
        { name: "Środa Popielcowa", free: false, date: addDays(easter, -46) },
        { name: "Walentynki", free: false, date: new Date(year, 1, 14) },
        { name: "Dzień Kobiet", free: false, date: new Date(year, 2, 8) },
        { name: "Dzień Matki", free: false, date: new Date(year, 4, 26) },
        { name: "Dzień Dziecka", free: false, date: new Date(year, 5, 1) },
        { name: "Dzień Ojca", free: false, date: new Date(year, 5, 23) },
        { name: "Andrzejki", free: false, date: new Date(year, 10, 29) },
        { name: "Mikołajki", free: false, date: new Date(year, 11, 6) },
        { name: "Sylwester", free: false, date: new Date(year, 11, 31) }
    ];

    return holidays.filter(function(holiday) {
        return holiday.date.getFullYear() === date.getFullYear() &&
               holiday.date.getMonth() === date.getMonth() &&
               holiday.date.getDate() === date.getDate();
    });
}
