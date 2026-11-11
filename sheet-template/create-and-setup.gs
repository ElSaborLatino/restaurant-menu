/**
 * ALL-IN-ONE: creates the Menu, Categories, en, tr and pt tabs with the data,
 * then applies the validation rules. No file upload needed.
 *
 * Use: in a blank Sheet, Extensions > Apps Script, delete the default code,
 * paste this whole file, then run createAndSetup().
 * Re-running overwrites the five tabs, so only run it on a fresh/practice Sheet.
 */

const DATA = {"Menu": [["number", "category_id", "name", "price_try", "available"], [1, "tapas", "PATATAS BRAVAS", 345, true], [2, "tapas", "CHAMPINONES AL AJILLO", 260, true], [3, "tapas", "TORTILLA ESPANOLA", 335, true], [4, "tapas", "GAMBAS AL AJILLO (4 Parça)", 385, true], [109, "tapas", "TAPAS PLATTER (4 Kişilik / For 4)", 1390, true], [54, "meat", "BISTECCA CON POMODORI SECCHI", 2150, true], [56, "meat", "GRILLED T-BONE STEAK", 2100, true], [67, "meat", "ESPETADA", 2150, true], [50, "chicken", "POLLO ALLA GRIGLIA", 570, true], [52, "chicken", "CHICKEN A LA CREMA", 840, true], [30, "pasta", "SPAGHETTI BOLOGNESE", 1130, true], [31, "pasta", "SPAGHETTI AL OLIO", 425, true], [44, "pasta", "LASAGNE DI CARNE", 995, true], [47, "noodles", "NOODLES WITH CHICKEN AND VEGETABLES", 575, true], [96, "noodles", "VEGAN SOBA NOODLES", 595, true], [70, "paella", "PAELLA WITH CHICKEN AND SEAFOOD (Serves 2)", 2560, true], [74, "paella", "PORTUGUESE PRAWNS AND CALAMARI", 790, true], [20, "salads", "MIXED SALAD", 260, true], [23, "salads", "FETA CHEESE SALAD", 535, true], [80, "kids", "GRILLED CHICKEN AND CHIPS", 450, true], [83, "kids", "SPAGHETTI NAPOLITANA", 350, true], [110, "desserts", "APPLE PIE", 340, true], [111, "desserts", "BANOFFEE PIE", 340, true], [112, "desserts", "TIRAMISU", 340, true], [113, "drinks", "SANGRIA (Jug / Sürahi - Serves 4)", 970, true], [114, "drinks", "SANGRIA (Glass / Kadeh)", 280, true], [115, "drinks", "CIELO 1908 CHARDONNAY (Italy) (Glass)", 320, true], [116, "drinks", "CIELO 1908 CHARDONNAY (Italy) (Bottle)", 1140, true], [117, "drinks", "EFES PILSEN (50cl)", 255, true], [118, "drinks", "TURKISH TEA (Demli Çay)", 90, true]], "Categories": [["category_id", "title_en", "title_tr", "title_pt"], ["tapas", "Tapas", "Başlangıçlar", "Tapas"], ["meat", "Meat", "Et", "Carne"], ["chicken", "Chicken", "Tavuk", "Frango"], ["pasta", "Pasta", "Makarnalar", "Massas"], ["noodles", "Noodles", "Erişte", "Noodles"], ["paella", "Paella & Fish", "Paella & Balık", "Paella & Peixe"], ["salads", "Salads", "Salatalar", "Saladas"], ["kids", "Kids", "Çocuk Menü", "Crianças"], ["desserts", "Desserts", "Tatlılar", "Sobremesas"], ["drinks", "Drinks & Wines", "İçecekler", "Bebidas & Vinhos"]], "en": [["number", "description"], [1, "Deep fried potatoes in spicy sauce"], [2, "Mushrooms in garlic sauce"], [3, "Traditional Spanish potato and onion omelette"], [4, "Prawns sautéed in olive oil and garlic"], [109, "Combination of prawns, patatas bravas, chicken wings and mushrooms"], [54, "Sirloin steak with sun-dried tomatoes and cream, served with potatoes and vegetables"], [56, "T-bone steak served with potatoes and vegetables"], [67, "Traditional Portuguese skewered fillet steak with salad and potatoes"], [50, "Grilled chicken breast with potatoes and vegetables"], [52, "Grilled chicken breast in cream and mushroom sauce"], [30, "Traditional minced beef and tomato sauce"], [31, "With garlic, olive oil and chilli pepper"], [44, "Minced meat lasagna served with salad"], [47, "Sautéed chicken and vegetable noodles"], [96, "High protein Buckwheat Soba noodles with vegetables and avocado"], [70, "Traditional Spanish dish of rice, seafood and chicken (Please allow 45 mins cooking time)"], [74, "Traditional Portuguese skewered grilled prawn and calamari served with potatoes and salad"], [20, "Mixed greens with tomato"], [23, "Tossed salad with feta cheese and apple"], [80, "Grilled chicken and chips"], [83, "Tomato sauce spaghetti"], [110, "Apple pie with cream and ice cream"], [111, "Biscuit base with banana, cream and ice cream"], [112, "Traditional Italian dessert with coffee aroma and mascarpone cheese"], [113, "Traditional fruit and spirit mix wine"], [114, "Traditional fruit and spirit mix wine"], [115, "Vino Blanco / White Wine (Glass / Bottle)"], [116, "Vino Blanco / White Wine (Glass / Bottle)"], [117, "Beer"], [118, "Traditional hot tea"]], "tr": [["number", "description"], [1, "Baharatlı ve acı soslu kızartılmış patates"], [2, "Sarımsak soslu mantar"], [3, "Patates ve soğanlı geleneksel İspanyol omleti"], [4, "Sarımsakla sote edilmiş karidesler"], [109, "Karışık tapas tabağı (Karides, patatas bravas, tavuk kanatları ve mantar)"], [54, "İtalyan kuru domates ve kremalı biftek, patates ve sebze ile"], [56, "T-bone steak, patates ve sebze ile"], [67, "Geleneksel Portekiz bonfile şiş, salata ve patates ile"], [50, "Izgara tavuk göğsü, patates ve sebze ile"], [52, "Kremalı ve mantarlı soslu ızgara tavuk göğsü"], [30, "Geleneksel kıymalı ve domates soslu spagetti"], [31, "Sarımsak, zeytinyağı ve acı biberli spagetti"], [44, "Kıymalı lazanya, salata ile"], [47, "Sote edilmiş tavuklu ve sebzeli erişte"], [96, "Yüksek proteinli karabuğday eriştesi, sebze ve avokado"], [70, "Geleneksel tavada ocak üstü pişirilen pirinç, tavuk ve deniz ürünü İspanyol yemeği"], [74, "Geleneksel Portekiz ızgara karides ve kalamar şiş, salata ve patates ile"], [20, "Yeşil salata, domates"], [23, "Beyaz peynirli, yeşillikli ve elmalı salata"], [80, "Izgara tavuk ve kızartılmış patates"], [83, "Domates soslu spagetti"], [110, "Elmalı pasta, krema ve dondurma ile"], [111, "Bisküvi üzeri muz, krema ve dondurma ile"], [112, "Geleneksel kahve aromalı, Mascarpone peynirli İtalyan tatlısı"], [113, "Geleneksel meyve ve alkol karışımlı şarap"], [114, "Geleneksel meyve ve alkol karışımlı şarap"], [115, "Beyaz Şarap (Kadeh / Şişe)"], [116, "Beyaz Şarap (Kadeh / Şişe)"], [117, "Bira"], [118, "Geleneksel demli Türk çayı"]], "pt": [["number", "description"], [1, "Batatas fritas com molho picante"], [2, "Cogumelos em molho de alho"], [3, "Omelete tradicional espanhola"], [4, "Camarões salteados em azeite e alho"], [109, "Prato misto de tapas"], [54, "Bife do sirloin com tomate seco e creme"], [56, "T-bone steak servido com batatas e legumes"], [67, "Espetada tradicional portuguesa"], [50, "Peito de frango grelhado com batatas e legumes"], [52, "Peito de frango em molho de cogumelos e natas"], [30, "Spaghetti à bolonhesa tradicional"], [31, "Com alho, azeite e pimenta picante"], [44, "Lasanha de carne picada servida com salada"], [47, "Noodles salteados com frango e legumes"], [96, "Noodles de trigo sarraceno com legumes e abacate"], [70, "Paella tradicional espanhola"], [74, "Espetada tradicional de camarão e lula"], [20, "Salada mista com tomate"], [23, "Salada com queijo feta e maçã"], [80, "Frango grelhado com batata frita"], [83, "Spaghetti com molho de tomate"], [110, "Tarte de maçã com creme e gelado"], [111, "Banoffee pie tradicional"], [112, "Tiramisu tradicional italiano"], [113, "Vinho tradicional com mistura de frutos e licores"], [114, "Vinho tradicional com mistura de frutos e licores"], [115, "Vinho Branco (Copo / Garrafa)"], [116, "Vinho Branco (Copo / Garrafa)"], [117, "Cerveja"], [118, "Chá quente tradicional turco"]]};

function createAndSetup() {
  const ss = SpreadsheetApp.getActive();
  const first = ss.getSheets()[0];
  Object.keys(DATA).forEach(name => {
    const rows = DATA[name];
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.clear();
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  });
  if (!DATA[first.getName()] && first.getLastRow() === 0) ss.deleteSheet(first);
  setupMenuSheet();
}

const LAST_ROW = 1000;
const LANG_TABS = ['en', 'tr', 'pt'];

function setupMenuSheet() {
  const ss = SpreadsheetApp.getActive();
  const menu = mustGet_(ss, 'Menu');
  const cats = mustGet_(ss, 'Categories');
  const langs = LANG_TABS.map(n => mustGet_(ss, n));

  setupMenu_(menu, cats);
  setupCategories_(cats);
  langs.forEach(setupLang_);

  [menu, cats].concat(langs).forEach(s => {
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, s.getLastColumn()).setFontWeight('bold');
    protectHeader_(s);
  });
  SpreadsheetApp.getUi().alert('Setup done. Now publish: File > Share > Publish to web (entire document, CSV, auto-republish on).');
}

function mustGet_(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) throw new Error('Missing tab: ' + name);
  return s;
}

function reset_(sheet, rangeA1) {
  const r = sheet.getRange(rangeA1);
  r.clearDataValidations();
  return r;
}

function reject_(rule, help) {
  return rule.setAllowInvalid(false).setHelpText(help).build();
}

// Menu: number (the id) | category_id | name | price_try | available
function setupMenu_(sheet, cats) {
  // number is the item's id: required, whole, unique across the sheet
  reset_(sheet, 'A2:A' + LAST_ROW).setDataValidation(reject_(
    SpreadsheetApp.newDataValidation().requireFormulaSatisfied(
      '=AND(ISNUMBER(A2),A2=INT(A2),A2>0,COUNTIF($A$2:$A,A2)=1)'),
    'Number is required, must be a whole number and must be unique. It also links the item to its translations, so avoid renumbering live items.'));

  // category_id: dropdown from the Categories tab
  reset_(sheet, 'B2:B' + LAST_ROW).setDataValidation(reject_(
    SpreadsheetApp.newDataValidation().requireValueInRange(cats.getRange('A2:A' + LAST_ROW), true),
    'Pick a category from the list (add new ones in the Categories tab first).'));

  // price_try: numbers only, no currency symbol
  reset_(sheet, 'D2:D' + LAST_ROW).setDataValidation(reject_(
    SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0),
    'Price must be a number, without the \u20ba symbol.'));

  // available: checkbox
  sheet.getRange('E2:E' + LAST_ROW).clearDataValidations().insertCheckboxes();

  // Highlight incomplete / duplicate rows in red (a row counts as "in use" if A:D has anything)
  const bad = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(
      '=AND(COUNTA($A2:$D2)>0,OR($A2="",COUNTIF($A$2:$A,$A2)>1,$B2="",$C2="",NOT(ISNUMBER($D2))))')
    .setBackground('#f8c9c9')
    .setRanges([sheet.getRange('A2:E' + LAST_ROW)])
    .build();
  sheet.setConditionalFormatRules([bad]);
}

// Categories: category_id | title_en | title_tr | title_pt
function setupCategories_(sheet) {
  reset_(sheet, 'A2:A' + LAST_ROW).setDataValidation(reject_(
    SpreadsheetApp.newDataValidation().requireFormulaSatisfied(
      '=AND(LEN(TRIM(A2))>0,COUNTIF($A$2:$A,A2)=1)'),
    'category_id is required and must be unique. Do not change it once items use it.'));
  const bad = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(COUNTA($A2:$D2)>0,OR($A2="",COUNTIF($A$2:$A,$A2)>1,$B2=""))')
    .setBackground('#f8c9c9')
    .setRanges([sheet.getRange('A2:D' + LAST_ROW)])
    .build();
  sheet.setConditionalFormatRules([bad]);
}

// en / tr / pt: number | description. number must exist in Menu and appear once per tab.
function setupLang_(sheet) {
  reset_(sheet, 'A2:A' + LAST_ROW).setDataValidation(reject_(
    SpreadsheetApp.newDataValidation().requireFormulaSatisfied(
      '=AND(COUNTIF(Menu!$A$2:$A,A2)>0,COUNTIF($A$2:$A,A2)=1)'),
    'Number must match an item number in the Menu tab and appear only once here.'));
  const bad = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(COUNTA($A2:$B2)>0,OR($A2="",COUNTIF($A$2:$A,$A2)>1))')
    .setBackground('#f8c9c9')
    .setRanges([sheet.getRange('A2:B' + LAST_ROW)])
    .build();
  sheet.setConditionalFormatRules([bad]);
}

// Warning-only: editing the header shows a confirmation prompt but never locks anyone out.
function protectHeader_(sheet) {
  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .filter(p => p.getDescription() === 'Header row')
    .forEach(p => p.remove());
  const p = sheet.getRange(1, 1, 1, sheet.getLastColumn()).protect();
  p.setDescription('Header row');
  p.setWarningOnly(true);
}
