# Portfolio Tracker. Brief projektu

## Cel

Aplikacja webowa do śledzenia własnego portfela inwestycyjnego: akcje, ETF-y, krypto i gotówka
w wielu walutach, z aktualnymi cenami i czytelnymi wykresami.

Dwa cele równolegle:
1. Ma być realnie używana codziennie przez autora
2. Ma być mocnym projektem portfolio na GitHubie (API, przeliczanie walut, wizualizacja danych, deploy)

Autor: Filip Góral, absolwent Management & AI, inwestuje od 2019 roku, celuje w konsulting
technologiczny i finanse.

---

## Zakres MVP. To i tylko to

Skupiamy się na jednym module zrobionym porządnie, zamiast wielu zrobionych połowicznie.

### Funkcje w wersji 1

1. **Dodawanie pozycji do portfela**
   - Pola: nazwa, ticker, typ (akcja / ETF / krypto / gotówka), ilość, cena zakupu, waluta zakupu, data zakupu
   - Edycja i usuwanie pozycji
   - Dane zapisywane trwale (przetrwają restart przeglądarki i serwera)

2. **Pobieranie aktualnych cen**
   - Krypto: CoinGecko API (darmowe, bez klucza)
   - Akcje i ETF: Stooq (darmowe CSV, obsługuje GPW i rynki zagraniczne) albo Finnhub / Alpha Vantage (darmowy tier, wymaga klucza w zmiennej środowiskowej)
   - Kursy walut: API NBP (darmowe, oficjalne, tabela A)
   - Ceny cache'owane, żeby nie przekraczać limitów zapytań
   - Obsługa sytuacji, gdy API nie odpowiada: pokazujemy ostatnią znaną cenę plus informację o tym

3. **Widok główny portfela**
   - Tabela pozycji: nazwa, ilość, cena zakupu, cena aktualna, wartość, zysk/strata w kwocie i procentach
   - Kolorowanie zysków i strat
   - Sortowanie po kolumnach
   - Wartość całego portfela przeliczona na PLN, plus podgląd w EUR i USD

4. **Wykresy**
   - Struktura portfela: udział poszczególnych pozycji (donut)
   - Podział według typu aktywa (akcje / krypto / gotówka)
   - Historia wartości portfela w czasie (linia), budowana ze snapshotów zapisywanych raz dziennie

5. **Podsumowanie na górze**
   - Łączna wartość portfela
   - Łączny zysk lub strata (kwota i procent)
   - Zmiana od wczoraj

### Czego świadomie NIE robimy w v1

Ważne, żeby nie rozjechał się zakres:

- Brak logowania i kont użytkowników (aplikacja jednoosobowa)
- Brak modułu budżetu domowego, nawyków, kalendarza i maili
- Brak automatycznego importu z brokera
- Brak rekomendacji inwestycyjnych i predykcji
- Brak aplikacji mobilnej (ma być tylko responsywna strona)

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** do stylowania
- **SQLite + Prisma** do trwałego zapisu danych (proste lokalnie, łatwe do migracji na Postgres przy deployu)
- **Recharts** albo **Chart.js** do wykresów
- Zapytania do zewnętrznych API wykonywane po stronie serwera (route handlers), żeby nie wystawiać kluczy
- Docelowy deploy: **Vercel** (baza: Vercel Postgres albo Supabase)

---

## Design

- Ciemny motyw premium: tło grafitowe lub granatowe, akcenty złote i tealowe, styl fintech
- Czytelna typografia, dużo powietrza, karty z zaokrągleniami około 14 px
- Kwoty zawsze formatowane z separatorem tysięcy i symbolem waluty
- Responsywność: ma działać na telefonie
- Interfejs po polsku
- W tekstach interfejsu nie używamy em dashów

---

## Model danych (propozycja)

```
Position
  id, name, ticker, assetType, quantity,
  purchasePrice, purchaseCurrency, purchaseDate, createdAt

PriceCache
  ticker, price, currency, fetchedAt

PortfolioSnapshot
  id, date, totalValuePLN, totalCostPLN
```

---

## Etapy pracy

1. Szkielet projektu, model danych, CRUD pozycji na sztywnych cenach
2. Widok tabeli i podsumowania, formatowanie walut
3. Integracja z API cen (najpierw krypto z CoinGecko, potem akcje) i z NBP dla kursów
4. Cache cen i obsługa błędów API
5. Wykresy struktury portfela
6. Snapshoty dzienne i wykres historii wartości
7. Dopracowanie designu i responsywności
8. README, testy podstawowej logiki (przeliczanie walut, obliczanie zysku), deploy na Vercel

---

## Kryteria ukończenia

Projekt uznajemy za skończony, gdy:

- Da się dodać pozycję, zobaczyć jej aktualną wycenę i usunąć ją
- Wartość portfela zgadza się po przeliczeniu ręcznym na kartce
- Aplikacja nie wywala się, gdy API cen nie odpowiada
- Jest publiczne repo z README zawierającym screenshot, opis funkcji, użyty stack i sekcję o tym, czego się nauczyłeś
- Jest działający link do wersji online

---

## Wskazówki dla asystenta kodującego

- Zanim zaczniesz pisać kod, zadaj pytania o rzeczy niejasne i zaproponuj plan
- Pracuj etapami, po każdym etapie pokaż działający efekt
- Pisz czytelne komunikaty commitów po polsku, bez polskich znaków
- Logikę obliczeń finansowych (przeliczanie walut, zysk, procenty) wydziel do osobnych funkcji i pokryj testami
- Klucze API trzymaj w pliku .env.local, który jest w .gitignore
