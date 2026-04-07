# PRD: QR Code Generation (Simplified UX)

## 1. Discovery & Problem Definition

**Problem**: Staff need a way to scan rooms using QR codes as a fallback for NFC. Supervisors need an efficient way to output these QR codes to PDF with physical size control (1" to 2.5").
**User**: Supervisors or Administrators.
**Scope**:
- Toggle feature visibility globally (Main Menu).
- Contextual "Print" action on TreeView nodes (Rooms/Units/Wings).
- Printable PDF output with customizable label dimensions (1" - 2.5").
- **Security Constraint**: QR codes MUST encode unique IDs (UUIDs), never PII or names.

---

## 2. Selected Design Options (Label Layouts)

Based on feedback, we will support two primary vertical stacked layouts.

| Option | Name | Visual Layout | Use Case |
|---|---|---|---|
| A | **Standard Stack** | QR (Mid) + Room Name (Top or Bottom) | Clean, high-contrast identification. |
| C | **Unit-Branded** | Unit Name (Top) + QR (Mid) + Room (Bottom) | Full contextual branding for larger facilities. |

![QR Label Layout Options](C:/Users/dthompson/.gemini/antigravity/brain/0e19b087-dd86-48db-8b35-bd72407886f4/qr_label_layout_options_grid_1770238079709.png)

---

## 3. Specification

### State Matrix

| State Component | Value | Behavior |
|---|---|---|
| `qrGenEnabledAtom` | `boolean` | If false, hides all QR-related UI (context menus, toggles). |
| `selectedNode` | `TreeNode` | Target for print action. If a group, all child rooms are collected. |
| `printOptions` | `Object` | Stores `size` (1-2.5"), `labelPosition` ('top'/'bottom'), `layout` ('standard'/'branded'). |

### User Flow
1. **Enable**: User opens Hamburger Menu -> Toggles "Show QR Actions".
2. **Select**: User hovers a Wing in the TreeView -> Clicks `[...]` -> Selects "Print QR Codes".
3. **Configure**: Options Modal opens. User adjusts size and label position (Top/Bottom).
4. **Output**: User clicks "Generate PDF" -> File downloads as `Safeguard_QRs_[Name]_[Date].pdf`.

---

## 4. Validation & Risks

### UX Risks
- **Printer Scaling**: Users often print with "Fit to page" enabled, which breaks the calculated "2.0 inch" scale.
    - *Mitigation*: Include a "Scale Check" line on the first page of the PDF for manual verification.
- **Tree Clutter**: Adding `[...]` to every tree node might satisfy power users but annoy regular monitors.
    - *Mitigation*: Hide the action menu by default until the global toggle is flipped.

### Definition of Done
- Toggle exists in Hamburger Menu.
- `[...]` menu appears on TreeView nodes (hover).
- PDF generates with correct items (selecting a Wing prints all child Rooms).
- Physical size of QR code matches user selection within 2mm.
