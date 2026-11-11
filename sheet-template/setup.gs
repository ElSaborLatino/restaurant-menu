/**
 * One-off setup for the Sabor menu Sheet.
 *
 * Run AFTER importing the five CSVs as tabs named exactly:
 *   Menu, Categories, en, tr, pt
 * Then: Extensions > Apps Script > paste this file > run setupMenuSheet().
 * Safe to re-run: it clears and re-applies the rules each time.
 */

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
