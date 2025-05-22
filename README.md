# 📊 Statistika výdajů

Aplikace pro sledování příjmů a výdajů s vizualizacemi, filtrováním, přizpůsobením kategorií a exportem dat. Umožňuje uživatelům snadno sledovat své finance v přehledném rozhraní.

---

## 🧠 Funkce

- ✅ Přidávání transakcí s typem (příjem/výdaj), kategorií, datem a částkou
- ✅ Přehled transakcí s filtrováním a stránkováním
- ✅ Statistiky za měsíc:
  - Koláčový graf podle kategorií
  - Sloupcový graf podle dnů
- ✅ Sekce "Balanc":
  - Celkový příjem a výdaj
  - Progres výdajů vůči příjmům
  - Největší transakce
- ✅ Vlastní kategorie:
  - Výběr ikony, barvy
  - Export/import do JSON
- ✅ Export transakcí do CSV
- ✅ Offline podpora přes Service Worker
- ✅ Mobilní responzivní design

---

## 📁 Struktura projektu

```
/
├── index.html
├── css/
│   ├── style.css
│   ├── mainPage.css
│   ├── transaction.css
│   ├── modal.css
│   ├── statistics.css
│   ├── balance.css
│   └── settings.css
├── js/
│   ├── script.js
│   ├── mainPage.js
│   ├── transaction.js
│   ├── statistics.js
│   ├── balance.js
│   ├── settings.js
│   ├── utils.js
│   └── sw.js
```

---

## ▶️ Spuštění projektu

2. Otevři `index.html` v prohlížeči.

3. Pro offline režim musíš otevřít projekt přes lokální server (např. pomocí VSCode Live Server).

---

## 🛠️ Technologie

- **HTML5** + **CSS3**
- **Vanilla JavaScript**
- **LocalStorage**
- **Canvas a SVG pro grafy**
- **Service Worker** (základní offline cache)

---

## 📦 Úložiště dat

- Transakce, kategorie a barvy jsou uloženy v `localStorage`.
- Kategorie je možné exportovat/importovat jako `.json` soubor.
- Transakce je možné exportovat do `.csv`.

---

## 📱 Responzivita

Projekt je optimalizovaný pro mobilní zařízení:
- Přizpůsobení grafů a seznamů
- Změna rozložení sidebaru
- Tlačítka přes celou šířku