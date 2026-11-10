import QtQuick
import QtQuick.Effects
import qs.Commons
import qs.Commons as Commons
import qs.Ui

// The Nyxiri menu trigger. Upstream is a single hardcoded Nerd Font glyph; this
// fork adds a mode switch and a small styling surface, all read from the bar
// layout entry's inline settings:
//
//   iconMode    "glyph" | "image" | "wordmark"   (default glyph)
//   glyph       "omarchy" | "arch" | "custom"    (default omarchy)
//   customGlyph any string, used when glyph == "custom"
//   iconFont    font family for a custom glyph   (default "omarchy")
//   iconSource  image or SVG path/URL            (image mode)
//   wordmark    text shown in wordmark mode      (default "Nyxiri")
//   tint        recolour an image with the bar foreground (default true)
//   hoverOpen   pass true/false to the menu payload (default true)
//
// Set them with `omarchy bar set devi.nyxiri-menu <key> <value>`, or from Nyxiri's
// settings card once it exposes the menu rows.
BarWidget {
  id: root
  moduleName: "devi.nyxiri-menu"

  readonly property string iconMode: String(setting("iconMode", "glyph"))
  readonly property string glyphKind: String(setting("glyph", "omarchy"))
  readonly property string customGlyph: String(setting("customGlyph", ""))
  readonly property string iconFont: String(setting("iconFont", "omarchy"))
  readonly property string iconSource: String(setting("iconSource", ""))
  readonly property string wordmark: String(setting("wordmark", "Nyxiri"))
  readonly property bool tint: setting("tint", true) === true
  readonly property bool hoverOpen: setting("hoverOpen", true) !== false

  readonly property string glyph: glyphKind === "arch" ? "\uf303"
    : glyphKind === "custom" ? customGlyph
    : "\ue900"

  // The slot is sized by the button in glyph/image mode, but a wordmark is
  // wider than the button's zero-width-space text, so the pill never grew
  // to fit it. Measure the wordmark text instead in that mode.
  implicitWidth: root.iconMode === "wordmark"
    ? wordmarkText.implicitWidth + Style.space(16)
    : button.implicitWidth
  implicitHeight: button.implicitHeight

  // The button owns size, hover chrome and input; the icon paints over it.
  // An empty glyph with a zero-width space keeps `hasVisualContent` true so
  // the button stays interactive without drawing a second icon.
  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: "\u200b"
    onPressed: function(mouse) {
      if (!root.bar) return
      if (mouse === Qt.RightButton) root.bar.run("xdg-terminal-exec")
      else root.bar.run("omarchy-shell shell toggle devi.nyxiri-menu '{\"menu\":\"root\",\"hoverOpen\":" + (root.hoverOpen ? "true" : "false") + "}'")
    }
  }

  Item {
    id: content
    anchors.fill: parent
    // Purely visual; clicks fall through to the button underneath.
    enabled: false

    Text {
      anchors.centerIn: parent
      visible: root.iconMode === "glyph"
      text: root.glyph
      color: root.bar ? root.bar.foreground : Commons.Color.foreground
      font.family: root.iconFont
      font.pixelSize: Style.font.iconLarge
      horizontalAlignment: Text.AlignHCenter
      verticalAlignment: Text.AlignVCenter
    }

    Text {
      id: wordmarkText
      anchors.centerIn: parent
      visible: root.iconMode === "wordmark"
      text: root.wordmark
      color: root.bar ? root.bar.foreground : Commons.Color.foreground
      font.family: root.bar ? root.bar.fontFamily : Style.font.family
      font.pixelSize: Style.font.body
      font.bold: true
      horizontalAlignment: Text.AlignHCenter
      verticalAlignment: Text.AlignVCenter
    }

    Image {
      id: iconImage
      anchors.centerIn: parent
      // Hidden: MultiEffect paints the only visible copy, so the source is
      // not drawn twice (and `colorization: 0` is still a passthrough).
      visible: false
      width: Math.min(parent.width, Style.font.iconLarge)
      height: width
      source: root.iconMode === "image" ? root.iconSource : ""
      sourceSize.width: width * Screen.devicePixelRatio
      sourceSize.height: height * Screen.devicePixelRatio
      fillMode: Image.PreserveAspectFit
      asynchronous: true
    }

    // Qt6's colorization path, so an SVG or PNG follows the theme without a
    // precompiled shader. `colorization: 0` is a passthrough copy.
    MultiEffect {
      anchors.fill: iconImage
      visible: root.iconMode === "image"
      source: iconImage
      colorization: root.tint ? 1 : 0
      colorizationColor: root.bar ? root.bar.foreground : Commons.Color.foreground
    }
  }
}
