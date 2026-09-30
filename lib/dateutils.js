var PL_WEEKDAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
var PL_MONTHS_NOM = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
var PL_MONTHS_GEN = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function isoWeek(date) {
    var d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var yearStart = new Date(d.getFullYear(), 0, 1);
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function dayOfYear(date) {
    // Compare calendar dates in UTC: immune to time of day and DST.
    var today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    var start = Date.UTC(date.getFullYear(), 0, 1);
    return Math.round((today - start) / 86400000) + 1;
}

function daysInYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

// phase 0..1 from SunCalc.getMoonIllumination(): 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter.
// Principal phases get a +/- 0.0339 window (~1 day); the rest are intermediate phases.
function moonPhaseIndex(phase) {
    var w = 0.0339;
    if (phase < w || phase > 1 - w) return 0;
    if (Math.abs(phase - 0.25) <= w) return 2;
    if (Math.abs(phase - 0.5) <= w) return 4;
    if (Math.abs(phase - 0.75) <= w) return 6;
    if (phase < 0.25) return 1;
    if (phase < 0.5) return 3;
    if (phase < 0.75) return 5;
    return 7;
}

function moonPhaseName(phase) {
    return ["Nów", "Przybywający sierp", "Pierwsza kwadra", "Przybywający garb",
            "Pełnia", "Ubywający garb", "Ostatnia kwadra", "Ubywający sierp"][moonPhaseIndex(phase)];
}

function moonPhaseIcon(phase) {
    return ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"][moonPhaseIndex(phase)];
}