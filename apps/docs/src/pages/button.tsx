import { Button, type ButtonProps } from '@vercetti/ui'
import { ArrowRight, Download, Trash2 } from 'lucide-react'
import * as React from 'react'
import {
  A11yNotes,
  PageHeader,
  Playground,
  Preview,
  PropsTable,
  SelectControl,
  Section,
  TextControl,
  ToggleControl,
  type PropDef,
} from '../components/playground'
import { CodeBlock } from '../components/code-block'

type Variant = NonNullable<ButtonProps['variant']>
type Size = NonNullable<ButtonProps['size']>

const VARIANTS: readonly Variant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'accent',
  'destructive',
  'link',
]
const SIZES: readonly Size[] = ['sm', 'md', 'lg', 'icon']

const PROPS: readonly PropDef[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'destructive' | 'link'",
    default: "'primary'",
    description: 'Visual intent. Only one primary action should compete for attention per view.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg' | 'icon'",
    default: "'md'",
    description: 'Control height. 36/40/44px respectively; icon is a 40px square.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Swaps the label for a spinner and sets aria-busy. The button stays disabled while busy.',
  },
  {
    name: 'loadingLabel',
    type: 'string',
    default: "'Loading'",
    description: 'Screen-reader text announced in place of the label while loading.',
  },
  {
    name: 'startIcon / endIcon',
    type: 'React.ReactNode',
    description: 'Icons flanking the label. Sized to 16px and marked aria-hidden automatically.',
  },
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: 'Render styles onto the child element instead of a <button> — for links and router components.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretch to the container width. Useful in mobile form footers.',
  },
]

const A11Y = [
  'Defaults to type="button". An unset type inside a form submits it — the most common bug in hand-rolled button components.',
  'Sizes clear WCAG 2.2 SC 2.5.8 (24×24px minimum). Use size="lg" on touch-primary surfaces to also meet the stricter 44pt platform guidance.',
  'The focus ring is offset into the page background, so it stays legible even when buttons sit flush against each other.',
  'loading sets aria-busy and renders the spinner as aria-hidden, with the status announced through visually hidden text instead.',
  'Icon-only buttons have no visible label, so they require an explicit sr-only span or aria-label — the icon itself is always aria-hidden.',
]

export function ButtonPage() {
  const [variant, setVariant] = React.useState<Variant>('primary')
  const [size, setSize] = React.useState<Size>('md')
  const [loading, setLoading] = React.useState(false)
  const [fullWidth, setFullWidth] = React.useState(false)
  const [label, setLabel] = React.useState('Save changes')

  const attrs = [
    variant !== 'primary' && `variant="${variant}"`,
    size !== 'md' && `size="${size}"`,
    loading && 'loading',
    fullWidth && 'fullWidth',
  ].filter(Boolean) as string[]

  const code =
    size === 'icon'
      ? `<Button${attrs.length ? ` ${attrs.join(' ')}` : ''}>
  <Download aria-hidden="true" />
  <span className="sr-only">${label || 'Download'}</span>
</Button>`
      : `<Button${attrs.length ? ` ${attrs.join(' ')}` : ''}>${label}</Button>`

  return (
    <div>
      <PageHeader
        eyebrow="Components"
        title="Button"
        description="A button that gets the boring things right: the default type attribute, a focus ring that survives adjacent controls, and a loading state that announces itself."
      />

      <Section title="Playground" description="Adjust the controls — the source below regenerates.">
        <Playground
          code={code}
          controls={
            <>
              <SelectControl label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
              <SelectControl label="size" value={size} options={SIZES} onChange={setSize} />
              <ToggleControl label="loading" checked={loading} onChange={setLoading} />
              <ToggleControl label="fullWidth" checked={fullWidth} onChange={setFullWidth} />
              <TextControl label="label" value={label} onChange={setLabel} placeholder="Button label" />
            </>
          }
        >
          <Button variant={variant} size={size} loading={loading} fullWidth={fullWidth}>
            {size === 'icon' ? (
              <>
                <Download aria-hidden="true" />
                <span className="sr-only">{label || 'Download'}</span>
              </>
            ) : (
              label || 'Button'
            )}
          </Button>
        </Playground>
      </Section>

      <Section
        title="Variants"
        description="Intent is carried by shape and colour together. Destructive actions are never the only primary-styled control in a view."
      >
        <Preview align="start">
          {VARIANTS.map((item) => (
            <Button key={item} variant={item}>
              {item}
            </Button>
          ))}
        </Preview>
      </Section>

      <Section title="With icons" description="Icons are constrained to 16px and never carry meaning alone.">
        <Preview align="start">
          <Button startIcon={<Download aria-hidden="true" />}>Download</Button>
          <Button variant="outline" endIcon={<ArrowRight aria-hidden="true" />}>
            Continue
          </Button>
          <Button variant="destructive" startIcon={<Trash2 aria-hidden="true" />}>
            Delete
          </Button>
          <Button variant="ghost" size="icon">
            <Download aria-hidden="true" />
            <span className="sr-only">Download file</span>
          </Button>
        </Preview>
      </Section>

      <Section
        title="Rendering as a link"
        description="asChild projects the styles onto its child, so a navigation control stays a real anchor. Nesting an <a> inside a <button> is invalid HTML and breaks middle-click, right-click, and keyboard activation semantics."
      >
        <CodeBlock
          code={`import { Link } from 'react-router-dom'

<Button asChild variant="outline">
  <Link to="/foundations">View foundations</Link>
</Button>`}
        />
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
