// Calendar page for an always-on display. ES5 only (iPad mini 2 / Safari 12).
(function () {
  'use strict';

  var params = parseQuery(location.search);
  var LAT = parseFloat(params.lat) || 52.2297;
  var LON = parseFloat(params.lon) || 21.0122;
  var WEATHER_EVERY_MS = 30 * 60 * 1000;
  var RELOAD_HOUR = 3; // daily full reload keeps a long-running page healthy

  var $ = function (id) { return document.getElementById(id); };
  var lastDayKey = null;
  var lastMinute = -1;
  var lastHour = -1;
  var sunToday = null;
  var lastWeatherOk = null;
  var startedAt = new Date();

  function parseQuery(q) {
    var out = {};
    q.replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hm(d) { return d && !isNaN(d) ? d.getHours() + ':' + pad(d.getMinutes()) : '—'; }
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  function durationText(ms) {
    var min = Math.round(ms / 60000);
    return Math.floor(min / 60) + ' h ' + (min % 60) + ' min';
  }

  // "2026-09-30T14:00" -> local Date. Safari 12 would parse this as UTC, so parse by hand.
  function parseLocal(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s);
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  }

  // ---------- calendar card ----------
  function renderCard(now) {
    var y = now.getFullYear();
    var holidays = getPolishHolidays(now);
    var free = now.getDay() === 0;
    var names = [];
    for (var i = 0; i < holidays.length; i++) {
      names.push(holidays[i].name);
      if (holidays[i].free) free = true;
    }

    $('monthYear').textContent = PL_MONTHS_NOM[now.getMonth()] + ' ' + y;
    $('dayNum').textContent = now.getDate();
    $('weekday').textContent = PL_WEEKDAYS[now.getDay()];
    $('holiday').textContent = names.join(' · ');
    $('card').className = 'card' + (free ? ' free' : '');

    var nd = NAMEDAYS[(now.getMonth() + 1) + '-' + now.getDate()];
    $('names').textContent = nd ? nd.split(',').join(', ') : '—';

    var doy = dayOfYear(now);
    var total = daysInYear(y);
    $('yearInfo').textContent = 'Tydzień ' + isoWeek(now) + ' · dzień ' + doy + ' z ' + total +
      ' · do końca roku ' + (total - doy);
  }

  // ---------- sun & moon ----------
  function renderAstro(now) {
    var noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    var yesterday = new Date(noon.getTime() - 864e5);
    var t = SunCalc.getTimes(noon, LAT, LON);
    var ty = SunCalc.getTimes(yesterday, LAT, LON);
    var len = t.sunset - t.sunrise;
    var diff = Math.round((len - (ty.sunset - ty.sunrise)) / 60000);

    $('sunrise').textContent = hm(t.sunrise);
    $('sunset').textContent = hm(t.sunset);
    $('dayLength').textContent = 'Dzień trwa ' + durationText(len) +
      (diff ? ' (' + (diff > 0 ? '+' : '−') + Math.abs(diff) + ' min)' : '');

    var ill = SunCalc.getMoonIllumination(now);
    $('moonIcon').textContent = moonPhaseIcon(ill.phase);
    $('moonName').textContent = moonPhaseName(ill.phase);
    $('moonLit').textContent = Math.round(ill.fraction * 100) + '% oświetlenia';

    var mt = SunCalc.getMoonTimes(new Date(noon.getFullYear(), noon.getMonth(), noon.getDate()), LAT, LON);
    var parts = [];
    if (mt.rise) parts.push('wschód ' + hm(mt.rise));
    if (mt.set) parts.push('zachód ' + hm(mt.set));
    if (mt.alwaysUp) parts.push('cały dzień nad horyzontem');
    if (mt.alwaysDown) parts.push('cały dzień pod horyzontem');
    $('moonTimes').textContent = parts.length ? 'Księżyc: ' + parts.join(', ') : '';

    sunToday = t;
  }

  function renderNextPhases(now) {
    var full = nextPhase(now, 0.5);
    var nu = nextPhase(now, 0);
    $('moonNext').textContent = full < nu
      ? 'Pełnia ' + shortDate(full) + ', nów ' + shortDate(nu)
      : 'Nów ' + shortDate(nu) + ', pełnia ' + shortDate(full);
  }

  // First moment after `from` when moon phase crosses `target` (0 = new, 0.5 = full), hourly resolution.
  function nextPhase(from, target) {
    var step = 3600 * 1000;
    var prev = SunCalc.getMoonIllumination(from).phase;
    for (var t = from.getTime() + step, i = 0; i < 24 * 31; i++, t += step) {
      var p = SunCalc.getMoonIllumination(new Date(t)).phase;
      // New moon: phase wraps from ~1 to ~0. A small dip near full moon is sign noise in the limb angle.
      var crossed = target === 0 ? p < prev - 0.5 : (prev < target && p >= target);
      if (crossed) return new Date(t);
      prev = p;
    }
    return null;
  }

  function shortDate(d) {
    if (!d) return '—';
    return d.getDate() + ' ' + PL_MONTHS_GEN[d.getMonth()];
  }

  function applyTheme(now, sunTimes) {
    var dark = params.theme ? params.theme === 'dark' : (now < sunTimes.sunrise || now >= sunTimes.sunset);
    document.documentElement.className = dark ? 'dark' : '';
  }

  // ---------- weather ----------
  function loadWeather() {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,is_day' +
      '&hourly=temperature_2m,weather_code,precipitation_probability,is_day' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum' +
      '&timezone=Europe%2FWarsaw&forecast_days=2';

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        renderWeather(data);
        lastWeatherOk = new Date();
        renderStatus();
      })
      .catch(function () {
        renderStatus('brak połączenia z serwisem pogody');
      });
  }

  function renderWeather(d) {
    var c = d.current;
    var info = weatherInfo(c.weather_code, c.is_day === 1);
    $('wIcon').textContent = info.icon;
    $('wTemp').textContent = Math.round(c.temperature_2m) + '°';
    $('wText').textContent = info.text;
    $('wFeels').textContent = 'Odczuwalna ' + Math.round(c.apparent_temperature) + '° · ' +
      'dziś ' + Math.round(d.daily.temperature_2m_min[0]) + '° / ' + Math.round(d.daily.temperature_2m_max[0]) + '°';

    $('wDetails').textContent =
      'Opady ' + d.daily.precipitation_probability_max[0] + '% (' + d.daily.precipitation_sum[0] + ' mm) · ' +
      'wiatr ' + Math.round(c.wind_speed_10m) + ' km/h · ' +
      'wilgotność ' + c.relative_humidity_2m + '% · ' +
      'ciśnienie ' + Math.round(c.pressure_msl) + ' hPa';

    // Next 5 slots, every 3 hours, starting from the next full hour.
    var h = d.hourly;
    var now = new Date();
    var start = 0;
    while (start < h.time.length && parseLocal(h.time[start]) <= now) start++;
    var html = '';
    for (var i = start, n = 0; i < h.time.length && n < 5; i += 3, n++) {
      var hi = weatherInfo(h.weather_code[i], h.is_day[i] === 1);
      html += '<div class="hour"><div class="muted">' + parseLocal(h.time[i]).getHours() + ':00</div>' +
        '<div class="h-icon">' + hi.icon + '</div>' +
        '<div>' + Math.round(h.temperature_2m[i]) + '°</div>' +
        '<div class="muted">' + h.precipitation_probability[i] + '%</div></div>';
    }
    $('wHours').innerHTML = html;
  }

  function renderStatus(err) {
    var s = lastWeatherOk ? 'Pogoda: Open-Meteo, aktualizacja ' + hm(lastWeatherOk) : '';
    if (err) s = (s ? s + ' · ' : '') + err;
    $('status').textContent = s;
  }

  // ---------- main loop ----------
  function tick() {
    var now = new Date();
    $('clock').textContent = now.getHours() + ':' + pad(now.getMinutes());
    $('sec').textContent = pad(now.getSeconds());

    var key = dayKey(now);
    var newDay = key !== lastDayKey;
    if (newDay) {
      lastDayKey = key;
      renderCard(now);
      renderNextPhases(now);
    }
    if (newDay || now.getHours() !== lastHour) {
      lastHour = now.getHours();
      renderAstro(now);
    }
    if (now.getMinutes() !== lastMinute) {
      lastMinute = now.getMinutes();
      applyTheme(now, sunToday);
      if (now.getHours() === RELOAD_HOUR && now.getMinutes() === 0 && now - startedAt > 3600 * 1000) {
        location.reload();
      }
    }
  }

  tick();
  loadWeather();
  setInterval(tick, 1000);
  setInterval(loadWeather, WEATHER_EVERY_MS);
})();
