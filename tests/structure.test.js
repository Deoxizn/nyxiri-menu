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
  for (const name of ["nyxiri-menu-core", "nyxiri-menu-merge", "nyxiri-open-payload"]) {
    assert.ok(seen.has(name), `missing ${name}`)
  }
})

test("MenuModel.js is unmodified upstream", () => {
  assert.equal(read("MenuModel.js"), read("upstream/MenuModel.js"))
})

test("manifest is a menu clone with the Nyxiri id", () => {
  const manifest = JSON.parse(read("manifest.json"))
  assert.equal(manifest.id, "devi.nyxiri-menu")
  assert.deepEqual(manifest.kinds, ["menu", "bar-widget"])
  assert.equal(manifest.omarchy.clonedFrom, "omarchy.menu")
  assert.equal(manifest.entryPoints.menu, "Menu.qml")
  assert.equal(manifest.entryPoints.barWidget, "BarWidget.qml")
})

test("the menu keeps the stock entry points and adds Nyxiri rows", () => {
  const menu = read("Menu.qml")
  assert.match(menu, /property string pendingInitialMenu: "root"/)
  assert.match(menu, /id: "nyxiri"/)
  assert.match(menu, /devi\.nyxiri openSettingsTab monitors/)
  assert.match(menu, /interval: root\.hoverDwell/)
  assert.match(menu, /property int hoverDwell: 400/)
})

test("the trigger reads its icon settings and opens devi.nyxiri-menu", () => {
  const widget = read("BarWidget.qml")
  assert.match(widget, /moduleName: "devi\.nyxiri-menu"/)
  for (const key of ["iconMode", "glyph", "customGlyph", "iconSource", "wordmark", "tint", "hoverOpen"]) {
    assert.match(widget, new RegExp(`setting\\("${key}"`), key)
  }
  assert.match(widget, /shell toggle devi\.nyxiri-menu/)
  assert.match(widget, /MultiEffect/)
  assert.match(widget, /colorization/)
})
