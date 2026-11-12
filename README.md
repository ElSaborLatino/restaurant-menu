# 🍷 Sabor - Digital Web Menu

A responsive digital menu for **Sabor** restaurant, with English, Turkish and Portuguese navigation and mobile-first browsing. The menu content lives in a Google Sheet that the restaurant owner edits; this repository is the public web page that displays it.

## 🌐 Live Menu & QR Code

* **Live URL:** [https://elsaborlatino.github.io/restaurant-menu/](https://elsaborlatino.github.io/restaurant-menu/)
* **Scan to View:**

<p align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://elsaborlatino.github.io/restaurant-menu/" alt="Sabor Menu QR Code" width="200" height="200">
</p>

---

## ✏️ Editing the menu (for the owner)

Edit the Google Sheet. Changes appear on the live menu within about 5 minutes, with no code changes and no need to publish again. (Google keeps a copy for up to 5 minutes.)

| Tab | What it holds |
|---|---|
| `Menu` | One row per item: `number`, `category_id`, `name`, `price_try`, `available` |
| `Categories` | One row per category: `category_id` plus a title in each language. Row order is the order of the category buttons. |
| `en`, `tr`, `pt` | Per language, matched to `Menu` by `number`: an optional translated `name` and a `description` |

**Common tasks**

* **Change a price or name:** edit it in `Menu`. Prices are numbers only, with no `₺`.
* **Hide an item without deleting it:** untick `available`.
* **Add an item:** add a row in `Menu` with a new, unused `number` and a category from the dropdown. Then add a row with the same `number` and a description in each of `en`, `tr` and `pt`. To translate the name too, fill in the `name` column in that language's tab. If it is empty, the name from `Menu` is used. Row order in `Menu` is the display order within a category.
* **Add a category:** add a row in `Categories` first, then it appears in the `category_id` dropdown.

**Rules**

* Every `number` must be unique. A number also links the item to its translations, so do not change the number of a live item. If you do, change it in `Menu`, `en`, `tr` and `pt` together.
* Rows highlighted red are incomplete or duplicated. Fix them or they may not appear.
* A missing description shows nothing, and a missing translated name falls back to the `Menu` name. A missing translated category title falls back to English. An item with a missing or invalid price, number or category is skipped.
* Do not delete the checkbox cells in the `available` column.

---

## 🛠️ How it works (for developers)

* **Frontend:** plain HTML, CSS and JavaScript (ES modules), with no build step.
  * `index.html` and `style.css`: the page and its styles.
  * `app.js`: fetches the Sheet, caches it and renders the page.
  * `menu.js`: turns the published CSV into a menu and handles bad data.
  * `config.js`: the Sheet id, the tab ids and the currency symbol. This is the only file to edit when switching to another Sheet.
* **Data flow:**
  1. The page shows the copy cached in the browser (if any) straight away.
  2. It fetches the published Sheet and replaces the menu with the fresh version.
  3. If that fails on a first visit, it falls back to `menu-snapshot.json`.
* **Snapshot:** `.github/workflows/refresh-snapshot.yml` refreshes `menu-snapshot.json` daily from the Sheet.
* **Languages:** English, Turkish and Portuguese. To add one, add a tab with `number` and `description` columns, a `title_xx` column in `Categories`, and the language in `config.js` and the dropdown in `index.html`.
* **Currency:** prices are shown in Turkish lira (`₺`).
* **Hosting:** GitHub Pages.

### Using a different Sheet

1. Make a copy of the Sheet (**File → Make a copy**). The copy should keep the tabs and the validation rules. If the rules are missing, re-add these data validation rules on the `Menu` tab, each set to reject invalid input:
   * `A2:A1000` (number): custom formula `=AND(ISNUMBER(A2),A2=INT(A2),A2>0,COUNTIF($A$2:$A,A2)=1)`
   * `B2:B1000` (category): dropdown from the range `Categories!A2:A`
   * `D2:D1000` (price): number greater than or equal to 0
   * `E2:E1000` (available): insert checkboxes
2. In the copy, go to **File → Share → Publish to web**, choose **Entire document** and **CSV**, and keep **Automatically republish when changes are made** ticked.
3. Update `SHEET_ID` and the tab ids in `config.js`. The id is the long `2PACX-…` part of the published link. Each tab's id is the number after `#gid=` in the Sheet's address bar when that tab is open.

### Running locally

ES modules do not load from a plain file, so serve the folder:

```
python3 -m http.server 8123
```

Then open http://localhost:8123.
