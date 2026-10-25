---
name: KicksControl
description: A premium sneaker store at the Kith / SVD standard (white ground, photography first, quiet chrome), with live stock per size and colour on every product page.
colors:
  paper: "#ffffff"
  paper-deep: "#f2f2f2"
  tile: "#f4f4f4"
  ink: "#111111"
  ink-soft: "#6b6b6b"
  form: "#111111"
  form-deep: "#3a3a3a"
  form-rule: "#e6e6e6"
  form-wash: "#f5f5f5"
  alarm: "#d4291f"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  category:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62.5"
  section:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  price:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "'tnum'"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  none: "0px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "40px"
  grid-gap: "16px"
  grid-row: "40px"
  section: "80px"
  header: "64px"
  control: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.form-deep}"
    textColor: "{colors.paper}"
  button-primary-disabled:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink-soft}"
  button-hero:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  filter-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "{spacing.control}"
    padding: "0 16px"
  filter-control-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  filter-chip:
    backgroundColor: "{colors.form-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  product-tile:
    backgroundColor: "{colors.tile}"
    rounded: "{rounded.none}"
  size-cell:
    textColor: "{colors.ink}"
    height: "44px"
    width: "56px"
  size-cell-hover:
    backgroundColor: "{colors.form-wash}"
  size-cell-marked:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper}"
  size-cell-low:
    textColor: "{colors.alarm}"
  field-label:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
---

# Design System: KicksControl

## Overview

**Creative North Star: "The White Shop Floor"**

KicksControl is built to the premium sneaker-store standard the user named as the bar, Kith and SVD: a white ground, the product photograph leading every view, and an interface that recedes until it is needed. Shoes sit on light-grey tiles that absorb the white and grey studio backgrounds the API photos arrive with; captions under them are small and quiet; type is black, bold and normal width. There are no cards, no rounded corners and no shadows on content.

The one thing a neighbouring store does not show lives on the product page: a size × colour matrix of live units, red when a size is running out, with a marked cell flooding with ink from the left and the figures counting up as the page arrives. Everything else follows the category canon: a thin one-row header with the four categories and an underlined search, a large centred hero shoe floating over a soft contact shadow, a "Novedades" row, four category tiles, then the full catalog under a sticky bar of square filter dropdowns.

Motion is present but disciplined: one ease, short durations, and all of it removed under `prefers-reduced-motion`. It handles the product (the shoe floats, a tile's photo pushes in, the photo morphs from grid to product page) rather than decorating the chrome.

**Key Characteristics:**
- White ground, near-black type, light-grey photo tiles, hairline grey rules, one red for last units and errors.
- Archivo throughout: bold normal width for names and headings, heavy extra-condensed uppercase only on category tiles.
- Square corners everywhere; flat content; shadows only on floating layers (dropdown, cart drawer) and under the floating shoe.
- The size × colour stock matrix with count-up figures, red last units and the ink-flood mark is the signature.
- Hovering a product in a grid swaps its price for its sizes in stock.

## Colors

A monochrome store: white, two greys for surfaces and rules, black for type and action, and a single red that only ever means scarcity or failure.

### Primary
- **Shop Black** (ink): all type, the primary action block, active filter controls, the underline of the search field, the rule under the matrix head. `form` holds the same black and is the ink of marks: the flooded size cell, the focus ring, the caret, link colour.
- **Graphite** (form-deep): the hover state of every black action; it floods the primary button from the left on hover.

### Tertiary
- **Last-Units Red** (alarm): stock of 5 or fewer (matrix cells, card size lists, "Últimas unidades" labels), the "no more units" line in the cart, errors, and the "Quitar" action on hover.

### Neutral
- **White** (paper): the ground of every store surface, the header, the sticky filter bar and the cart drawer; text on black.
- **Photo Tile Grey** (tile): the ground behind every product photo in grids, category tiles and the cart.
- **Skeleton Grey** (paper-deep): loading placeholders and the disabled primary button.
- **Wash** (form-wash): hover on size cells, dropdown options and steppers; the ground of removable active-filter chips.
- **Hairline** (form-rule): header and footer rules, matrix cell borders, idle filter-control borders, dividers.
- **Caption Grey** (ink-soft): brand names, secondary copy, counts, breadcrumbs, footer links, unmade-size dots.

### Named Rules
**The One Red Rule.** Red means a size is running out or something failed. It is never a sale colour, a badge fill or decoration.
**The Tile Absorbs The Studio Rule.** Every product photo sits on Photo Tile Grey (the hero uses White) and is blended with `mix-blend-mode: darken`, so the photo's own white or grey backdrop disappears into the tile. Photos that ship with a full studio backdrop (Nike, Puma) fill the tile edge to edge (`object-cover`); cut-outs are contained with padding.
**The Colourless Chrome Rule.** The interface has no hue. Colour on the page comes from the shoes and from red scarcity only.

## Typography

**Display / Body Font:** Archivo (variable, with width axis), fallback `ui-sans-serif, system-ui, sans-serif`. Tabular numerals across the store.

**Character:** One grotesque family in two cuts. Bold normal width carries product names and headings with tight tracking, as the reference stores set them; the extra-condensed heavy uppercase cut is kept for the category tiles, where the word sits on the photo like a shop sign.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5vw, 4rem), 1, -0.025em): the hero shoe's name, centred under it.
- **Headline** (700, clamp(2rem, 3.5vw, 2.75rem), 1, -0.025em): the product name on its page; titles of secondary pages (Mis pedidos, Pedido, Mi perfil, Finalizar compra).
- **Category** (800, extra-condensed `font-stretch: 62.5%`, uppercase, 0.92): category names on their tiles, clamp(1.4rem, 6vw, 2rem) on small screens, clamp(2rem, 3vw, 3rem) from lg.
- **Section** (800, 1.25rem, 1.1, uppercase): section heads (Novedades, Comprar por categoría, Todas las zapatillas, Tu carrito).
- **Wordmark** (800, 1.375rem, -0.04em, uppercase): "KICKSCONTROL" in header and footer only. It is the logotype, not a step of the ramp.
- **Price** (600, 1.25rem, tabular): the price on the product page; card prices are body size.
- **Body** (400, 0.875rem, 1.5): captions under products, navigation, filters, readouts; descriptions at 1.625 line height, max 65ch, in Caption Grey.
- **Caption** (400, 0.75rem): brand above a product name in grids, breadcrumbs, fine print.
- **Label** (600, 0.6875rem, 0.06em, uppercase, Caption Grey): data field labels only, such as the matrix column heads (Talla EU, sizes), the cart's brand and total labels.

### Named Rules
**The Normal-Width Rule.** Product names and page titles are bold and normal width. The condensed uppercase cut belongs to category tiles; it does not spread to headings.
**The Label Labels Data Rule.** Small uppercase labels name a value (Talla EU, Total). They never sit above a heading as an invented kicker.

## Layout

Content max width 90rem with gutters of 16px / 24px / 40px (mobile / sm / lg). The header is sticky, 64px, one row on desktop; below lg the categories move to a second, horizontally scrolling row and search is hidden below md. The home page runs: hero (the shoe in a 16:8 stage on white, max 62vh, name, brand · price and "Ver producto" centred under it), Novedades (four products, 64px above), Comprar por categoría (four 3:4 tiles, 80px above), and the full catalog (80px above) with its filter bar sticky under the header. Product grids are 2 columns up to lg and 4 from lg, 16px column gap and 32-40px row gap; photo tiles are square. The product page is a 7/5 split from lg: the photo column is sticky (top 6rem), the right column holds name, price, the matrix, the action and the description. The footer is the wordmark and one row of grey links, then one line of fine print.

## Elevation & Depth

Flat. Content (tiles, grids, the product page) carries no shadow; separation comes from white space and hairline rules. Depth appears in three places only: floating layers that sit above the page, and the shoe that floats above its own shadow.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 18px 40px -20px rgba(17,17,17,0.3)`): the open filter dropdown.
- **Drawer** (`box-shadow: -24px 0 48px -24px rgba(17,17,17,0.25)`): the cart drawer's leading edge, over an overlay of ink at 40%.
- **Contact shadow** (radial ellipse, `rgba(17,17,17,0.22)` to transparent, multiplied): under the floating shoe; it narrows and fades as the shoe rises.

### Named Rules
**The Flat Content Rule.** Nothing that is part of the page casts a shadow. A shadow means "this layer floats above the page" or "this shoe is in the air", nothing else.

## Shapes

Square corners everywhere (0px): buttons, filter controls, dropdowns, chips, tiles, steppers, the drawer. Colour swatches are square chips with a faint inset ink ring, split diagonally for two-tone colourways. Rules are 1px. The only curve in the system is the shoe's elliptical contact shadow.

## Components

### Motion
One ease for everything that moves (`cubic-bezier(0.16, 1, 0.3, 1)`), staggered through a `--d` delay where items arrive in sequence.
- **Floating shoe:** enters from below (1000ms), then floats 12px on a 6s loop over its breathing contact shadow, and leans toward a mouse pointer (max 7deg; touch and pen stay flat). Backdrop photos do not float.
- **Morph:** the product photo morphs from its grid tile into the product page through a shared view transition (520ms).
- **Count up:** matrix figures roll up from 60% of their value to the value with a quartic decelerate (450ms), staggered by row and column, so an in-stock cell never reads 0.
- **Ink flood:** a marked cell fills with ink from the left (clip-path, 180ms).
- **Arrivals:** grid items and tiles fade up on scroll via `animation-timeline: view()` where supported; the hero caption and dropdowns fade up 14px (700ms); matrix rows and cart lines stagger in.
- **Tile push:** a tile's photo scales to 1.06 on hover (900ms).
- **Feedback:** the cart count bumps (420ms); the drawer slides in from the right (380ms) over a fading overlay (300ms).
Reduced motion removes every entrance, float, tilt, zoom and morph; figures land at their value instantly.

### Buttons
- **Shape:** square (0px).
- **Primary:** Shop Black block, white bold 1rem text, 56px tall, full width on the product page and in the drawer.
- **Hover / Focus:** Graphite floods the button from the left (260ms); press scales to 0.99; focus is a 2px ink outline offset 2px.
- **Disabled:** Skeleton Grey with Caption Grey text, carrying the instruction ("Elige una talla").
- **Hero action:** the same black block at 14px × 32px, semibold 0.875rem ("Ver producto"); turns Graphite on hover.
- **Text actions:** ink, underlined with a 4px offset (Ver todo, Limpiar todo, Seguir comprando).

### Chips
- **Filter controls:** 40px square buttons with a Hairline border and medium 0.875rem text plus a chevron; hover darkens the border to ink; an active filter turns solid black with white text and shows its value ("Marca: Nike").
- **Active-filter chips:** Wash ground, label and a small ×; removing one is a click; "Limpiar todo" follows as a text action.

### Cards / Containers
There are no cards. A product in a grid is a square Photo Tile Grey tile with the shoe, then caption-size grey brand, medium 0.875rem name and the price below, on white.
- **Hover (pointer devices):** the photo pushes in; the price fades out and the sizes in stock slide up in its place, last-unit sizes in red. Touch devices keep the price.
- **Stock state:** "Últimas unidades" in red or "Agotado" in grey sits at the tile's top left; sold-out photos drop to 40% opacity and greyscale.
- **Category tile:** a 3:4 photo tile, the category name in the condensed cut at bottom left, "Ver todo" at top right, underlined on hover.

### Inputs / Fields
- **Search:** no box; a 1px ink underline with a magnifier at left, 0.875rem placeholder in Caption Grey.
- **Focus:** a 2px ink outline offset 2px on every focusable element in the store.

### Navigation
- **Header:** sticky white bar, 64px, Hairline bottom rule; wordmark left, the four categories in medium 0.875rem (hover underline), then search, account and the bag icon with its count at right. Icons are Heroicons outline.
- **Footer:** Hairline top rule, wordmark, one row of Caption Grey links that turn ink on hover, one line of fine print.
- **Pagination:** Anterior / Página n de m / Siguiente on a Hairline rule.

### Size × colour stock matrix (signature)
Rows are colourways, each led by its swatch and name; columns are EU sizes headed by labels over an ink rule; cells are live unit counts as buttons (44px tall, 56px column) separated by Hairline borders. Unmade size: a centred grey dot. Sold out: struck through, grey at 60%, disabled. 5 or fewer units: red. Hover: Wash. Marked: ink floods the cell from the left and the figure turns white. Under the matrix a live readout states colour, size, units available and any surcharge, then the primary button. The same flood marks the selected size in the Talla dropdown.

### Status and stock labels
Bordered uppercase label text (0.6875rem, 600) in the status's own colour: "Últimas unidades" in red, "Agotado" in grey. No tinted or filled pills.

### Cart drawer
A white panel from the right (max 28rem) with the Drawer shadow; head with the section title and a close icon, lines with a small photo tile, brand label, name, size and colour, a square Hairline stepper, subtotal and "Quitar"; the total as a label with a bold 1.5rem figure; the primary button to checkout.

## Do's and Don'ts

### Do:
- **Do** let the photo lead: square Photo Tile Grey tiles, `mix-blend-mode: darken`, small captions underneath.
- **Do** show units per size and colour on every product page, with red at 5 or fewer.
- **Do** keep the chrome colourless: black, white and greys; red only for scarcity and errors.
- **Do** use the left-to-right ink flood for marking a choice, and the Graphite flood for hovering a black action.
- **Do** use the shared ease, and give every animation a reduced-motion fallback.
- **Do** keep corners square and content flat.

### Don't:
- **Don't** round corners.
- **Don't** put shadows on content or wrap products in cards; shadows belong to the dropdown, the drawer and the floating shoe.
- **Don't** add accent hues to the interface, gradients or glow.
- **Don't** set product names or page titles in the condensed uppercase cut; it is for category tiles.
- **Don't** put a small label above a heading as an eyebrow or kicker.
- **Don't** use tinted or filled status pills; status is bordered text.
- **Don't** use emoji or glyphs as icons; use Heroicons.

Scope: the customer store, login and register. The backoffice keeps its previous look until it is redesigned.
