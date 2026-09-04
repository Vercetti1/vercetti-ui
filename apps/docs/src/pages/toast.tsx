import { Button, type ToastVariant, useToast } from '@vercetti/ui'
import * as React from 'react'
import { CodeBlock } from '../components/code-block'
import {
  A11yNotes,
  PageHeader,
  Playground,
  PropsTable,
  SelectControl,
  Section,
  TextControl,
  ToggleControl,
  type PropDef,
} from '../components/playground'

const VARIANTS: readonly ToastVariant[] = ['default', 'success', 'warning', 'destructive']

const PROPS: readonly PropDef[] = [
  {
    name: 'title',
    type: 'string',
    description: 'Required. Keep it to a short outcome statement — this is what gets announced first.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Optional supporting detail.',
  },
  {
    name: 'variant',
    type: "'default' | 'success' | 'warning' | 'destructive'",
    default: "'default'",
    description: 'Sets the icon and accent. Destructive also switches the live region to assertive.',
  },
  {
    name: 'duration',
    type: 'number',
    default: '5000',
    description: 'Milliseconds before auto-dismiss. Pass Infinity to pin the toast until dismissed.',
  },
  {
    name: 'action',
    type: '{ label: string; onClick: () => void }',
    description: 'An optional single action, such as undo. Invoking it dismisses the toast.',
  },
  {
    name: 'ToastProvider limit',
    type: 'number',
    default: '4',
    description: 'Maximum simultaneously visible toasts. Older ones are dropped past the limit.',
  },
]

const A11Y = [
  'Auto-dismiss timers pause while the pointer is over the region or focus is inside it, then resume with the remaining time banked — not restarted. A toast with an action can otherwise expire mid-read, which fails WCAG 2.2.1.',
  'Informational toasts announce politely so they queue behind whatever the user is doing; destructive ones use role="alert" with aria-live="assertive" because an error genuinely needs to interrupt.',
  'Toasts sit above modals in the z-scale, so a confirmation is never hidden behind the dialog that triggered it.',
  'The viewport container is pointer-events-none with each toast re-enabling them, so the empty column never swallows clicks on the page beneath.',
  'Bottom padding respects env(safe-area-inset-bottom), keeping toasts clear of the iOS home indicator.',
  'Every toast is dismissible by keyboard, and the icon is decorative — the variant is always also conveyed by the text.',
  'Pending timers are cleared on unmount, so a dismiss can never fire against a torn-down provider.',
]

export function ToastPage() {
  const { toast, dismissAll } = useToast()
  const [variant, setVariant] = React.useState<ToastVariant>('success')
  const [title, setTitle] = React.useState('Changes saved')
  const [withAction, setWithAction] = React.useState(false)
  const [persistent, setPersistent] = React.useState(false)

  const attrs = [
    `title: '${title}'`,
    variant !== 'default' && `variant: '${variant}'`,
    persistent && 'duration: Infinity',
    withAction && `action: { label: 'Undo', onClick: revert }`,
  ].filter(Boolean) as string[]

  const code = `const { toast } = useToast()

toast({
  ${attrs.join(',\n  ')},
})`

  return (
    <div>
      <PageHeader
        eyebrow="Components"
        title="Toast"
        description="Written from scratch rather than wrapped, because the interesting part is the timer model. Countdowns pause on hover and focus and resume with the time already elapsed banked, so a toast never expires while it is being read."
      />

      <Section
        title="Playground"
        description="Fire one, then hover it — the countdown stops. Move away and it resumes where it left off rather than restarting."
      >
        <Playground
          code={code}
          controls={
            <>
              <SelectControl label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
              <TextControl label="title" value={title} onChange={setTitle} />
              <ToggleControl label="action" checked={withAction} onChange={setWithAction} />
              <ToggleControl label="duration: Infinity" checked={persistent} onChange={setPersistent} />
            </>
          }
        >
          <Button
            onClick={() =>
              toast({
                title: title || 'Notification',
                description:
                  variant === 'destructive'
                    ? 'The server rejected the request. Nothing was changed.'
                    : 'Your workspace is up to date.',
                variant,
                ...(persistent ? { duration: Number.POSITIVE_INFINITY } : {}),
                ...(withAction
                  ? { action: { label: 'Undo', onClick: () => toast({ title: 'Reverted' }) } }
                  : {}),
              })
            }
          >
            Show toast
          </Button>
          <Button variant="outline" onClick={dismissAll}>
            Dismiss all
          </Button>
        </Playground>
      </Section>

      <Section
        title="Setup"
        description="One provider at the root of the tree. The viewport renders itself, so there is no separate mount point to place."
      >
        <CodeBlock
          code={`import { ToastProvider } from '@vercetti/ui'

createRoot(el).render(
  <ToastProvider limit={4} duration={5000}>
    <App />
  </ToastProvider>,
)`}
        />
      </Section>

      <Section
        title="Stacking limit"
        description="Past the limit the oldest toast is dropped: a wall of stacked notifications is worse than missing the tail of a burst."
      >
        <div className="rounded-surface border border-border bg-card p-8 text-center">
          <Button
            variant="outline"
            onClick={() => {
              for (let i = 1; i <= 6; i += 1) {
                toast({ title: `Notification ${i}`, description: 'One of six fired at once.' })
              }
            }}
          >
            Fire six at once
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Six are queued; four are shown.
          </p>
        </div>
      </Section>

      <Section
        title="Errors"
        description="Destructive toasts switch to role=alert and an assertive live region. Reserve that for genuine failures — an assertive announcement interrupts whatever the screen reader was saying."
      >
        <CodeBlock
          code={`toast({
  title: 'Upload failed',
  description: 'The file exceeded the 25 MB limit.',
  variant: 'destructive',
  duration: Infinity, // let the user dismiss a real error themselves
})`}
        />
      </Section>

      <Section title="Options">
        <PropsTable props={PROPS} />
      </Section>

      <Section title="Accessibility">
        <A11yNotes notes={A11Y} />
      </Section>
    </div>
  )
}
