# Nucleus color theme

Approved palette: neutral charcoal workspace, clean white landing page, muted blue actions and selection.

| Role | Token | Color |
| --- | --- | --- |
| Workspace background | `--background` | `#18191B` |
| Panels | `--card` | `#222428` |
| Main text | `--foreground` | `#ECEDEF` |
| Secondary text | `--muted-foreground` | `#9A9EA7` |
| Primary action and focus | `--primary`, `--ring` | `#91ACDF` |
| Text on primary actions | `--primary-foreground` | `#151C28` |
| Dividers | `--border` | `#303238` |
| Landing background | `--paper` | `#F8F9FB` |
| Landing text | `--ink` | `#202329` |
| Landing links | `--link` | `#415F91` |

Use the global tokens for shared UI and the drawing editor. The landing's dark product preview inherits the same workspace tokens. Most surfaces stay neutral; blue identifies primary actions, focus, and selection. Existing cluster colors remain identifiers. Success, warning, and error colors retain their semantic roles.

The landing uses dark text on muted blue buttons and a darker blue for small text links on white. This avoids low-contrast pale blue text on a light surface. Typography, spacing, motion, and application behavior are unchanged by this palette update.

Core text contrast: main workspace text 15.02:1, secondary text on panels 5.79:1, primary button text 7.46:1, landing body text 14.95:1, landing secondary text 5.16:1, and landing links 6.10:1. These measurements cover the named text pairs, rather than claiming an accessibility audit of every component.
