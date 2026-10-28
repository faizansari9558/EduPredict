# 18 — Design System & Visual Tokens

## 1. Design Tokens & Color Palette

EduPredict utilizes a curated, enterprise-grade color system engineered for high contrast, readability, and modern aesthetics.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COLOR TOKEN PALETTE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ PRIMARY NAVY ]        [ SLATE BACKGROUND ]     [ SURFACE CARDS ]         │
│  #0f172a (Slate 900)     #f8fafc (Slate 50)       #ffffff (Pure White)      │
│                                                                             │
│  [ ACCENT BLUE ]         [ SUCCESS EMERALD ]      [ WARNING AMBER ]         │
│  #2563eb (Blue 600)      #10b981 (Emerald 500)    #f59e0b (Amber 500)       │
│                                                                             │
│  [ DANGER CRIMSION ]     [ TEXT PRIMARY ]         [ TEXT MUTED ]            │
│  #ef4444 (Red 500)       #1e293b (Slate 800)      #64748b (Slate 500)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Color Tokens Table
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `color-primary` | `#0f172a` | Topbars, primary brand text, main buttons |
| `color-accent` | `#2563eb` | Active tabs, interactive links, primary call-to-actions |
| `color-surface` | `#ffffff` | Content cards, modal dialogs, data table backgrounds |
| `color-background`| `#f8fafc` | Global application shell background |
| `color-success` | `#10b981` | Verified status badges, passing tests, high placement chance |
| `color-warning` | `#f59e0b` | Pending review status, moderate risk indicators, timer warnings |
| `color-danger` | `#ef4444` | Rejected documents, failed test assertions, at-risk flags |
| `color-border` | `#e2e8f0` | Card borders, table dividers, input borders |

---

## 2. Typography Hierarchy

- **Primary Font Family:** `Inter`, `Segoe UI`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Monospace Font Family:** `Fira Code`, `JetBrains Mono`, `Cascadia Code`, `monospace` (used in Coding Arena)

| Style Level | Font Size | Font Weight | Line Height | CSS Token |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (Hero / Page Title)** | `32px` (`2rem`) | Bold (`700`) | `1.25` | `text-2xl font-bold` |
| **Heading 2 (Section Title)** | `24px` (`1.5rem`) | SemiBold (`600`) | `1.3` | `text-xl font-semibold` |
| **Heading 3 (Card Header)** | `18px` (`1.125rem`) | SemiBold (`600`) | `1.4` | `text-lg font-semibold` |
| **Body Text** | `14px` (`0.875rem`) | Regular (`400`) | `1.5` | `text-sm font-normal` |
| **Small / Helper Text** | `12px` (`0.75rem`) | Medium (`500`) | `1.4` | `text-xs font-medium` |
| **Code Editor Text** | `13px` (`0.8125rem`)| Regular (`400`) | `1.6` | `font-mono text-xs` |

---

## 3. UI Components & Patterns

### 3.1 Status Badges
```html
<!-- Verified Badge -->
<span class="badge badge-success">✓ Verified</span>

<!-- Pending Badge -->
<span class="badge badge-warning">⏳ Pending Review</span>

<!-- Rejected Badge -->
<span class="badge badge-danger">✕ Rejected</span>
```

### 3.2 Data Cards & Containers
- Border Radius: `8px` (`rounded-lg`)
- Border: `1px solid #e2e8f0` (`border border-slate-200`)
- Box Shadow: `0 1px 3px rgba(0, 0, 0, 0.05)` (`shadow-sm`)
- Hover Transition: `all 0.2s ease-in-out` (`transition-all duration-200`)

---

## 4. Modern Google Stitch Styling & Tailwind CSS v4 Integration

The `stitch/` frontend leverages Tailwind CSS v4 with modern utilities:
- Glassmorphism overlays (`backdrop-blur-md bg-white/80`).
- Subtle gradients for score gauges and metric counters.
- Responsive grid containers (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`).
- Recharts animated tooltips and accessible SVG chart primitives.
