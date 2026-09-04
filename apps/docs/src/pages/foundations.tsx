import { CodeBlock } from '../components/code-block'
import { PageHeader, Section } from '../components/playground'

interface Swatch {
  token: string
  role: string
  contrast?: string
}

const SURFACE_TOKENS: readonly Swatch[] = [
  { token: 'background', role: 'Page canvas' },
  { token: 'foreground', role: 'Primary body text', contrast: '18.1:1 light · 18.6:1 dark' },
  { token: 'card', role: 'Raised surfaces, dialogs, panels' },
  { token: 'muted', role: 'Recessed fills, table headers, hover states' },
  {
    token: 'muted-foreground',
    role: 'Secondary text, descriptions, captions',
    contrast: '7.4:1 light · 8.1:1 dark',
  },
  { token: 'border', role: 'Decorative separators (exempt from 1.4.11)' },
  { token: 'input', role: 'Control boundaries', contrast: '4.6:1 light · 3.3:1 dark' },
]

const INTENT_TOKENS: readonly Swatch[] = [
  { token: 'primary', role: 'Default action', contrast: '17.4:1 against its foreground' },
  { token: 'accent', role: 'Brand, links, focus rings', contrast: '5.6:1 light · 7.9:1 dark' },
  { token: 'destructive', role: 'Irreversible actions, errors', contrast: '4.5:1 minimum' },
  { token: 'success', role: 'Confirmations', contrast: '4.9:1 light' },
  { token: 'warning', role: 'Cautions', contrast: '4.9:1 light' },
]

const TYPE_SCALE = [
  { className: 'text-4xl font-semibold tracking-tight', label: 'Display · 36px/600' },
  { className: 'text-3xl font-semibold tracking-tight', label: 'H1 · 30px/600' },
  { className: 'text-xl font-semibold tracking-tight', label: 'H2 · 20px/600' },
  { className: 'text-base', label: 'Body · 16px/400' },
  { className: 'text-sm', label: 'Small · 14px/400' },
  { className: 'font-mono text-xs uppercase tracking-widest', label: 'Label · 12px mono' },
] as const

function SwatchRow({ swatch }: { swatch: Swatch }) {
  return (
    <div className="flex items-center gap-4 border-b border-border p-4 last:border-0">
      <div
        aria-hidden="true"
        className="size-10 shrink-0 rounded-control border border-border"
        style={{ backgroundColor: `var(--vercetti-${swatch.token})` }}
      />
      <div className="min-w-0 flex-1">
        <code className="font-mono text-xs text-accent">--vercetti-{swatch.token}</code>
        <p className="mt-0.5 text-sm text-muted-foreground">{swatch.role}</p>
      </div>
      {swatch.contrast && (
        <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:block">
          {swatch.contrast}
        </span>
      )}
    </div>
  )
}

export function FoundationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Foundations"
        title="Design tokens"
        description="Two layers: raw --vercetti-* values that change per colour scheme, mapped onto Tailwind's --color-* namespace with @theme inline. Because the mapping is inline, utilities resolve the variable at runtime — which is what lets one stylesheet serve both themes."
      />

      <Section
        title="Surfaces and text"
        description="Contrast ratios are measured, not estimated. Body text targets WCAG 1.4.3 (4.5:1); control boundaries target 1.4.11 (3:1). Toggle the theme in the header to check both."
      >
        <div className="rounded-surface border border-border bg-card">
          {SURFACE_TOKENS.map((swatch) => (
            <SwatchRow key={swatch.token} swatch={swatch} />
          ))}
        </div>
      </Section>

      <Section
        title="Intent"
        description="Colour never carries meaning alone — every intent pairs with an icon or text label, so the information survives greyscale and colour blindness."
      >
        <div className="rounded-surface border border-border bg-card">
          {INTENT_TOKENS.map((swatch) => (
            <SwatchRow key={swatch.token} swatch={swatch} />
          ))}
        </div>
      </Section>

      <Section
        title="Typography"
        description="Inter for the interface, JetBrains Mono for code and labels. Body copy stays at 16px with a 1.5 line height; nothing in the UI drops below 12px."
      >
        <div className="space-y-5 rounded-surface border border-border bg-card p-6">
          {TYPE_SCALE.map((entry) => (
            <div key={entry.label}>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {entry.label}
              </p>
              <p className={`${entry.className} text-foreground`}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Stacking order"
        description="A named z-scale, because arbitrary z-[9999] values are how overlay bugs start. Toasts intentionally sit above modals so a confirmation is never hidden behind the dialog that triggered it."
      >
        <CodeBlock
          language="css"
          code={`--z-index-dropdown: 40;  /* popovers, combobox lists, sticky header */
--z-index-overlay:  50;  /* dialog scrim */
--z-index-modal:    60;  /* dialog content */
--z-index-toast:    70;  /* always outranks modals */`}
        />
      </Section>

      <Section
        title="Motion"
        description="Durations sit in the 120–200ms band: fast enough to feel immediate, slow enough to read as movement. Exits are shorter than entrances, so dismissing feels like the UI getting out of the way."
      >
        <CodeBlock
          language="css"
          code={`--animate-overlay-in:  overlay-in  160ms cubic-bezier(0.16, 1, 0.3, 1);
--animate-overlay-out: overlay-out 120ms ease-in;
--animate-content-in:  content-in  180ms cubic-bezier(0.16, 1, 0.3, 1);
--animate-content-out: content-out 130ms ease-in;`}
        />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          All of it is decoration — the components remain fully usable without
          animation, so <code className="font-mono text-xs text-accent">prefers-reduced-motion</code>{' '}
          reduces every duration to near-zero rather than substituting a
          different effect.
        </p>
      </Section>
    </div>
  )
}
