# Link Color Tokens

Semantic tokens for interactive text links (e.g. "Trouble signing in?" on Login).

## Light Mode

- **Default** — `--control-fg-link-default` → `--primitives-theme-700` → `#195BC7`
- **Hover** — `--control-fg-link-hover` → `--primitives-theme-900` → `#193665`
- **Active** — `--control-fg-link-active` → `--primitives-theme-975` → `#0A1527`

## Dark Mode

- **Default** — `--control-fg-link-default` → `--primitives-theme-300` → `#ADCFFB`
- **Hover** — `--control-fg-link-hover` → `--primitives-theme-100` → `#E7F0FF`
- **Active** — `--control-fg-link-active` → `--primitives-theme-50` → `#F2F7FE`

## Usage

Applied globally to `<a>` tags via `base.css`. For standalone link-styled buttons, use the `LinkButton` component with `variant="primary"`.

## Sources

- Semantics: `src/styles/semantics.css`
- Primitives: `src/styles/generated/figma-primitives-core.css`
- Global styles: `src/styles/base.css`
