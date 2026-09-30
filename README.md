# Kalendarz

Kartka z kalendarza do wyświetlania na stałe na tablecie (projektowana pod iPad mini 2, iOS 12, orientacja pozioma).

Pokazuje: datę, dzień tygodnia, święta, imieniny, numer tygodnia i dnia roku, zegar, pogodę (bieżącą i prognozę co 3 h), wschód/zachód Słońca, fazę i wschód/zachód Księżyca oraz najbliższą pełnię i nów. Po zachodzie słońca strona przechodzi w ciemną tonację.

## Lokalizacja

Domyślnie Warszawa. Inne miejsce: `?lat=50.06&lon=19.94`.

## Użycie na iPadzie

1. Otwórz stronę w Safari → Udostępnij → **Do ekranu początkowego** (tryb pełnoekranowy).
2. Ustawienia → Ekran i jasność → **Autoblokada: Nigdy**.
3. Opcjonalnie: Ustawienia → Ogólne → Dostępność → **Dostęp nadzorowany**, aby zablokować urządzenie na tej stronie.

## Źródła danych

- Pogoda: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0), odświeżana co 30 min.
- Słońce i Księżyc: [SunCalc](https://github.com/mourner/suncalc) 1.9.0 (BSD-2-Clause), obliczenia lokalne.
- Imieniny: pakiet npm [namedays](https://www.npmjs.com/package/namedays) 5.0.1 (MIT).
