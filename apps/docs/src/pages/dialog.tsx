import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from '@vercetti/ui'
import * as React from 'react'
import { CodeBlock } from '../components/code-block'
import {
  A11yNotes,
  KeyboardTable,
  PageHeader,
  Playground,
  PropsTable,
  SelectControl,
  Section,
  ToggleControl,
  type PropDef,
} from '../components/playground'

type Size = NonNullable<DialogContentProps['size']>
const SIZES: readonly Size[] = ['sm', 'md', 'lg', 'xl']

const PROPS: readonly PropDef[] = [
  {
    name: 'open / onOpenChange',
    type: 'boolean / (open: boolean) => void',
    description: 'Controlled state on Dialog. Omit both for uncontrolled behaviour driven by DialogTrigger.',
  },
  {
    name: 'modal',
    type: 'boolean',
    default: 'true',
    description: 'When true, content outside the dialog is hidden from assistive technology and pointer events.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg' | 'xl'",
    default: "'md'",
    description: 'Max width on sm breakpoints and up. Below that the dialog is always viewport width minus a 1rem gutter.',
  },
  {
    name: 'hideCloseButton',
    type: 'boolean',
    default: 'false',
    description: 'Removes the built-in close control. Only use it when you render your own — never to force a decision.',
  },
  {
    name: 'onEscapeKeyDown / onPointerDownOutside',
    type: '(event) => void',
    description: 'Call preventDefault to keep the dialog open. Reserve this for genuinely destructive confirmations.',
  },
]

const KEYS = [
  { keys: 'Tab', action: 'Cycles focus within the dialog. Focus cannot escape while it is open.' },
  { keys: 'Shift + Tab', action: 'Cycles focus backwards, wrapping to the last element.' },
  { keys: 'Esc', action: 'Closes the dialog and returns focus to the element that opened it.' },
]

const A11Y = [
  'Focus moves into the dialog on open and returns to the trigger on close — without the restore step, keyboard users land back at the top of the document.',
  'The rest of the page is marked aria-hidden while open, so a screen reader cannot wander into content the user cannot see. Note this is done with aria-hidden on sibling content rather than aria-modal on the dialog — same effect, wider support.',
  'DialogTitle is wired to aria-labelledby and DialogDescription to aria-describedby automatically. Omitting the title logs a development warning.',
  'Body scroll is locked while open, which also prevents iOS Safari scroll-chaining behind the overlay.',
  'The footer stacks in reverse on narrow viewports, keeping the primary action nearest the thumb on mobile and on the right at desktop widths.',
  'Content taller than the viewport scrolls inside the dialog rather than scrolling the page beneath it.',
]

export function DialogPage() {
  const [size, setSize] = React.useState<Size>('md')
  const [hideClose, setHideClose] = React.useState(false)

  const attrs = [size !== 'md' && `size="${size}"`, hideClose && 'hideCloseButton'].filter(
    Boolean,
  ) as string[]

  const code = `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open dialog</Button>
  </DialogTrigger>
  <DialogContent${attrs.length ? ` ${attrs.join(' ')}` : ''}>
    <DialogHeader>
      <DialogTitle>Delete project</DialogTitle>
      <DialogDescription>
        This permanently removes the project and its history.
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive">Delete project</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`

  return (
    <div>
      <PageHeader
        eyebrow="Components"
        title="Dialog"
        description="A modal built on the Radix primitive. Focus trapping, focus restore, scroll locking, and hiding the rest of the page from assistive technology are delegated rather than reimplemented — those are the parts that are easy to get subtly wrong."
      />

      <Section title="Playground" description="Open it, then try Tab and Esc.">
        <Playground
          code={code}
          controls={
            <>
              <SelectControl label="size" value={size} options={SIZES} onChange={setSize} />
              <ToggleControl label="hideCloseButton" checked={hideClose} onChange={setHideClose} />
            </>
          }
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent size={size} hideCloseButton={hideClose}>
              <DialogHeader>
                <DialogTitle>Delete project</DialogTitle>
                <DialogDescription>
                  This permanently removes the project and its history. This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Playground>
      </Section>

      <Section
        title="Scrolling content"
        description="The dialog caps at the viewport height and scrolls internally, so long content stays reachable on short screens."
      >
        <div className="rounded-surface border border-border bg-card p-8 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open long dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terms of service</DialogTitle>
                <DialogDescription>Last updated 4 September 2026.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {Array.from({ length: 12 }, (_, i) => (
                  <p key={i}>
                    Section {i + 1}. This placeholder paragraph exists to overflow the dialog so
                    that the internal scroll container, and the fact that the page behind it stays
                    locked, can both be verified by hand.
                  </p>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Decline</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Accept</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      <Section
        title="Blocking dismissal"
        description="For a genuinely destructive confirmation you can suppress outside-press and Escape. Do it sparingly: a dialog with no obvious exit is a trap, so always leave an explicit Cancel."
      >
        <CodeBlock
          code={`<DialogContent
  onPointerDownOutside={(event) => event.preventDefault()}
  onEscapeKeyDown={(event) => event.preventDefault()}
>
  {/* still render an explicit Cancel control */}
</DialogContent>`}
        />
      </Section>

      <Section title="Keyboard">
        <KeyboardTable rows={KEYS} />
      </Section>

      <Section title="Props">
        <PropsTable props={PROPS} />
      </Section>

      <Section title="Accessibility">
        <A11yNotes notes={A11Y} />
      </Section>
    </div>
  )
}
