"use strict"

const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const root = path.join(__dirname, "..")
const read = (name) => fs.readFileSync(path.join(root, name), "utf8")

test("every NYXIRI-BEGIN block has a matching end", () => {
  const lines = read("Menu.qml").split(/\r?\n/)
  let open = null
  const seen = new Set()
  for (let i = 0; i < lines.length; i++) {
    const begin = lines[i].match(/NYXIRI-BEGIN\s+([A-Za-z0-9_-]+)/)
    const end = lines[i].match(/NYXIRI-END\s+([A-Za-z0-9_-]+)/)
    if (begin) {
      assert.equal(open, null, `nested block at line ${i + 1}: ${begin[1]}`)
      open = { name: begin[1], line: i + 1 }
      seen.add(begin[1])
    } else if (end) {
      assert.ok(open, `unmatched end at line ${i + 1}: ${end[1]}`)
      assert.equal(open.name, end[1], `block ${open.name} closed as ${end[1]}`)
      open = null
    }
  }
  assert.equal(open, null, open ? `unclosed block ${open.name}` : "")
  for (const name of ["nyxiri-menu-core", "nyxiri-open-payload"]) {
    assert.ok(seen.has(name), `missing ${name}`)
  }
})

test("MenuModel.js differs from upstream only by the guard-id sanitization", () => {
  // MenuModel.js is otherwise a pristine upstream copy, but the guard ids
  // are interpolated into a generated bash script (F3), so ids that fail
  // the safe pattern are dropped in guardLine. The test strips exactly
  // that patch and requires everything else to be byte-identical, so an
  // upstream rebase still shows up here as a failure. One Hexciri
  // divergence is stripped the same way: summonAction's regex matches
  // `hexciri-shell shell summon ...` (the forked shell rewrites the
  // stock `omarchy-shell` call), and is mapped back to upstream before
  // the comparison.
  const patch = `// NYXIRI-SECURITY: guard ids are interpolated into the generated bash
// script and echoed back as \`<id>:<tag>:<0|1>\`, parsed by splitting on \`:\`.
// An id carrying \`:\`, a newline, or shell metacharacters could forge
// another row's answer or break out of the echo, so only ids made of
// letters, digits, dot, underscore, and hyphen reach the script. Anything
// else is skipped; its \`when:\` stays at the default (visible), the same
// as a guard that never answered.
var GUARD_ID_PATTERN = /^[A-Za-z0-9._-]+$/

`
  const guard = `  if (!GUARD_ID_PATTERN.test(String(id || ""))) return ""
`
  const filter = `  // guardLine returns "" for ids that fail the safe pattern; drop those
  // instead of leaving blank lines in the script.
  lines = lines.filter(function (line) { return line !== "" })
`
  const model = read("MenuModel.js")
  assert.ok(model.includes(patch), "guard-id pattern block missing from MenuModel.js")
  assert.ok(model.includes(guard), "guard-id check missing from guardLine")
  assert.ok(model.includes(filter), "empty-line filter missing from guardScript")
  const summonHexciri = `  var match = /^hexciri-shell shell summon ([A-Za-z0-9._-]+)(?: '([^']*)')?$/.exec(String(action || ""))\n`
  const summonUpstream = `  var match = /^omarchy-shell shell summon ([A-Za-z0-9._-]+)(?: '([^']*)')?$/.exec(String(action || ""))\n`
  assert.ok(model.includes(summonHexciri), "hexciri-shell summon regex missing from MenuModel.js")
  const stripped = model.replace(patch, "").replace(guard, "").replace(filter, "").replace(summonHexciri, summonUpstream)
  assert.equal(stripped, read("upstream/MenuModel.js"))
})

test("guardScript drops ids that are unsafe in the generated bash", () => {
  const MenuModel = require(path.join(root, "MenuModel.js"))
  const script = MenuModel.guardScript({
    "root.good-row": { when: "true" },
    "bad:id": { when: "true" },
    "evil\nforged:w:1": { when: "true" },
    'evil"; touch /tmp/pwned; echo "': { when: "true" },
  })
  assert.match(script, /good-row:w:1/)
  assert.doesNotMatch(script, /bad:id/)
  assert.doesNotMatch(script, /forged/)
  assert.doesNotMatch(script, /pwned/)
  // A menu of only unsafe ids produces no script at all.
  assert.equal(MenuModel.guardScript({ "bad:id": { when: "true" } }), "")
})

test("manifest is a menu clone with the Nyxiri id", () => {
  const manifest = JSON.parse(read("manifest.json"))
  assert.equal(manifest.id, "pizza.dirty.nyxiri-menu")
  assert.deepEqual(manifest.kinds, ["menu", "bar-widget"])
  assert.equal(manifest.omarchy.clonedFrom, "omarchy.menu")
  assert.equal(manifest.entryPoints.menu, "Menu.qml")
  assert.equal(manifest.entryPoints.barWidget, "BarWidget.qml")
})

test("the menu keeps the stock entry points and has no Nyxiri rows", () => {
  const menu = read("Menu.qml")
  assert.match(menu, /property string pendingInitialMenu: "root"/)
  // No Nyxiri submenu: the bat on the bar opens settings now.
  assert.doesNotMatch(menu, /id: "nyxiri"/)
  assert.doesNotMatch(menu, /nyxiriMenuRows/)
  assert.doesNotMatch(menu, /nyxiriItems\(\)/)
  assert.doesNotMatch(menu, /pizza\.dirty\.nyxiri openSettings/)
  assert.match(menu, /interval: root\.hoverDwell/)
  assert.match(menu, /property int hoverDwell: 400/)
})

test("the trigger reads its icon settings and opens pizza.dirty.nyxiri-menu", () => {
  const widget = read("BarWidget.qml")
  assert.match(widget, /moduleName: "pizza\.dirty\.nyxiri-menu"/)
  for (const key of ["iconMode", "glyph", "customGlyph", "iconSource", "wordmark", "tint", "hoverOpen"]) {
    assert.match(widget, new RegExp(`setting\\("${key}"`), key)
  }
  assert.match(widget, /shell toggle pizza\.dirty\.nyxiri-menu/)
  assert.match(widget, /MultiEffect/)
  assert.match(widget, /colorization/)
  assert.match(widget, /wordmarkText\.implicitWidth/)
  // The wordmark renders Shibumi-preview style: uppercased with wide
  // letterspacing, so a typed wordmark reads as a logo, not a label.
  assert.match(widget, /text: root\.wordmark\.toUpperCase\(\)/)
  assert.match(widget, /font\.letterSpacing: 1\.2/)
})

test("the manifest id is pizza.dirty.nyxiri-menu", () => {
  const manifest = JSON.parse(read("manifest.json"))
  assert.equal(manifest.id, "pizza.dirty.nyxiri-menu")
})

// Typo-tolerant search (upstream PR #19938, forward-ported): a search that
// finds nothing runs a second pass forgiving typos in name words.
const menuModel = require(path.join(root, "MenuModel.js"))

test("typo-tolerant search forgives typos only in the typo pass", () => {
  const theme = menuModel.normalizeItem("appearance.theme", { label: "Theme Picker", action: "x" })
  assert.equal(menuModel.matchesQuery(theme, "thene", true), false)
  assert.equal(menuModel.matchesQueryWithTypos(theme, "thene", true), true)
  assert.equal(menuModel.matchesQueryWithTypos(theme, "pikcer", true), true)
  assert.equal(menuModel.matchesQueryWithTypos(theme, "pikc theme", true), true)
  assert.equal(menuModel.matchesQueryWithTypos(theme, "thx", true), false)
  assert.equal(menuModel.matchesQueryWithTypos(theme, "thene", false), false)

  const filesApp = Object.assign(menuModel.normalizeItem("apps.files", { label: "Files", action: "x" }), { order: 0 })
  assert.equal(menuModel.matchesQuery(filesApp, "ffiles", true), false)
  assert.equal(menuModel.matchesQueryWithTypos(filesApp, "ffiles", true), true)
  assert.equal(menuModel.matchesQueryWithTypos(filesApp, "ffil", true), true)

  const fontApp = Object.assign(menuModel.normalizeItem("apps.font", { label: "Font", action: "x" }), { order: 0 })
  const frontApp = Object.assign(menuModel.normalizeItem("apps.front", { label: "Front", action: "x" }), { order: 1 })
  const apps = { "apps.font": fontApp, "apps.front": frontApp }
  assert.ok(
    menuModel.searchScore(apps, fontApp, "ffont", true) < menuModel.searchScore(apps, frontApp, "ffont", true),
    "doubled-letter matches rank above general one-edit typos",
  )

  const bluetooth = menuModel.normalizeItem("bluetooth", { label: "Bluetooth", action: "x" })
  assert.equal(menuModel.matchesQueryWithTypos(bluetooth, "bluetoxx", true), true)
  assert.equal(menuModel.matchesQueryWithTypos(bluetooth, "bluetxx", true), false)
  assert.equal(menuModel.matchesQueryWithTypos(bluetooth, "bluetoooth", true), true)
})

test("typo-tolerant search folds multilingual text and skips CJK edit distance", () => {
  const typo = (id, label, query) =>
    menuModel.matchesQueryWithTypos(menuModel.normalizeItem(id, { label, action: "x" }), query, true)
  assert.equal(typo("sv.settings", "Inställningar", "installningar"), true)
  assert.equal(typo("vi.go", "Đi", "di"), true)
  assert.equal(typo("pl.look", "Wygląd", "wyglad"), true)
  assert.equal(typo("tr.light", "Işık", "isik"), true)
  assert.equal(typo("el.go", "Μετάβαση", "μεταβαση"), true)
  assert.equal(typo("ar.learn", "تعلّم", "تعلم"), true)
  assert.equal(typo("ko.learn", "배우기", "배어기"), true)
  assert.equal(typo("zh.apps", "应用", "应答"), false)
})

// Runs Menu.qml's own two-pass search over a small synthetic menu.
const searchWithFiles = menuModel.mergeAppRows(
  {
    root: menuModel.normalizeItem("root", { label: "Root" }),
    appearance: menuModel.normalizeItem("appearance", { label: "Appearance" }),
    "appearance.font": menuModel.normalizeItem("appearance.font", { label: "Font", action: "x" }),
    apps: menuModel.normalizeItem("apps", { label: "Apps" }),
  },
  ["root", "appearance", "appearance.font", "apps"],
  [
    { id: "apps.files", parent: "apps", kind: "app", label: "Files", description: "", aliases: [] },
    { id: "apps.foot", parent: "apps", kind: "app", label: "Foot", description: "", aliases: [] },
  ],
)

test("Menu.qml runs a typo second pass only when exact search finds nothing", () => {
  const menuQml = read("Menu.qml")
  const qmlFunction = (name, params) => new Function("root", "MenuModel", "displayModel", "Qt", ...params,
    `with (root) {${menuQml.match(new RegExp(`\\n  function ${name}\\(${params.join(", ")}\\) \\{([\\s\\S]*?)\\n  \\}\\n`))[1]}}`)
  const menuMatchesQuery = qmlFunction("matchesQuery", ["entry", "query", "typos"])
  const menuRebuildDisplay = qmlFunction("rebuildDisplay", ["typos"])

  const searchIds = (query) => {
    const rows = []
    const displayModel = { count: 0, clear: () => { rows.length = 0 }, append: (row) => rows.push(...(Array.isArray(row) ? row : [row])) }
    const rootStub = Object.assign({}, searchWithFiles, {
      activeMenu: "root", filterText: query, rowsLoaded: true, dmenuActive: false, searchDivider: false, layoutSerial: 0,
      item: (id) => searchWithFiles.items[id] || null,
      isDescendantOf: (id, ancestorId) => menuModel.isDescendantOf(searchWithFiles.items, id, ancestorId),
      parentPathFor: (id) => menuModel.parentPathFor(searchWithFiles.items, id),
      isVisible: () => true,
      isDisabled: () => false,
      searchScore: (entry, q, typos) => menuModel.searchScore(searchWithFiles.items, entry, q, typos),
      displayRow: (entry, detail, score) => menuModel.displayRow(searchWithFiles.items, searchWithFiles.itemOrder, {}, {}, entry, detail, score),
      settleCursor: () => {},
      matchesQuery: (entry, q, typos) => menuMatchesQuery(rootStub, menuModel, displayModel, null, entry, q, typos),
      rebuildDisplay: (typos) => menuRebuildDisplay(rootStub, menuModel, displayModel, { callLater: () => {} }, typos),
    })
    rootStub.rebuildDisplay()
    return rows.map((row) => row.itemId)
  }

  assert.equal(searchIds("ffiles")[0], "apps.files")
  assert.ok(searchIds("fnot").includes("appearance.font"))
  const fontIds = searchIds("font")
  assert.ok(fontIds.includes("appearance.font"))
  assert.equal(fontIds.includes("apps.foot"), false)
})

test("typo search skips DP for pasted long strings", () => {
  const vm = require("node:vm")
  const model = vm.createContext({})
  vm.runInContext(read("MenuModel.js"), model)
  const origPrefixDistances = model.prefixDistances
  let dpCalls = 0
  model.prefixDistances = (a, b) => (dpCalls++, origPrefixDistances(a, b))
  for (const id of searchWithFiles.itemOrder) model.matchesQueryWithTypos(searchWithFiles.items[id], "a".repeat(256), true)
  assert.equal(dpCalls, 0)
})
