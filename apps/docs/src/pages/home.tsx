import { Button } from '@vercetti/ui'
import { Accessibility, ArrowRight, Blocks, Palette, Type } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CodeBlock } from '../components/code-block'
import { Section } from '../components/playground'

const PRINCIPLES = [
  {
    Icon: Accessibility,
    title: 'Accessible by construction',
    body: 'Every interactive component is keyboard operable and announces its state. Focus rings are part of the design, not something bolted on afterwards.',
  },
  {
    Icon: Blocks,
    title: 'Headless where it counts',
    body: 'Behaviour comes from Radix primitives or is written against the WAI-ARIA pattern directly. Styling is a thin, fully overridable layer on top.',
  },
  {
    Icon: Palette,
    title: 'One token layer',
    body: 'Semantic CSS variables drive both themes. Components never reference a raw hex, so retheming is a token swap rather than a refactor.',
  },
  {
    Icon: Type,
    title: 'Typed variants',
    body: 'Variants are declared with cva, so every size and intent is a checked union. An invalid variant is a compile error.',
  },
] as const

const INSTALL = `npm install @vercetti/ui`

const USAGE = `import { Button, ToastProvider, useToast } from '@vercetti/ui'
import '@vercetti/ui/tokens.css'

function SaveButton() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => toast({ title: 'Saved', variant: 'success' })}
    >
      Save changes
    </Button>
  )
}

export function App() {
  return (
    <ToastProvider>
      <SaveButton />
    </ToastProvider>
  )
}`

export function HomePage() {
  return (
    <div>
      <header className="mb-14">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          TypeScript · Tailwind CSS · Radix
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          A component library that takes accessibility as the starting point.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Vercetti UI is a headless-first React library. Four components, documented
          properly — every keyboard interaction, every ARIA attribute, and every
          contrast ratio stated rather than assumed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/components/combobox">
              Browse components
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/foundations">View foundations</Link>
          </Button>
        </div>
      </header>

      <Section title="Principles">
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-surface border border-border bg-card p-5">
              <Icon aria-hidden="true" className="mb-3 size-5 text-accent" />
              <h3 className="mb-1.5 font-medium text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Installation"
        description="The package ships ES modules with rolled-up type declarations. React and the Radix primitives stay external."
      >
        <CodeBlock code={INSTALL} language="bash" />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Component class names live inside the package, outside your app&apos;s
          Tailwind content graph. Register them in your CSS entry so they are not
          stripped from the build:
        </p>
        <CodeBlock
          className="mt-3"
          language="css"
          code={`@import 'tailwindcss';\n@import '@vercetti/ui/tokens.css';\n@source '../node_modules/@vercetti/ui/src';`}
        />
      </Section>

      <Section title="Usage" description="Wrap the tree once, then call the hook anywhere beneath it.">
        <CodeBlock code={USAGE} />
      </Section>
    </div>
  )
}
