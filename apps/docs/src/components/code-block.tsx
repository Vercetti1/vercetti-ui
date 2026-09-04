import { Check, Copy } from 'lucide-react'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import * as React from 'react'
import { cn } from '@vercetti/ui'
import { useTheme } from '../lib/theme'

/**
 * Syntax themes are defined against our own tokens rather than imported from
 * prism, so code samples stay in the same palette as the components they
 * document in both light and dark mode.
 */
const darkTheme: PrismTheme = {
  plain: { color: '#e2e8f0', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment'], style: { color: '#64748b', fontStyle: 'italic' } },
    { types: ['keyword', 'builtin'], style: { color: '#c4b5fd' } },
    { types: ['string', 'char'], style: { color: '#86efac' } },
    { types: ['function', 'tag'], style: { color: '#7dd3fc' } },
    { types: ['attr-name', 'property'], style: { color: '#fcd34d' } },
    { types: ['number', 'boolean'], style: { color: '#fdba74' } },
    { types: ['punctuation', 'operator'], style: { color: '#94a3b8' } },
  ],
}

const lightTheme: PrismTheme = {
  plain: { color: '#0f172a', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment'], style: { color: '#64748b', fontStyle: 'italic' } },
    { types: ['keyword', 'builtin'], style: { color: '#6d28d9' } },
    { types: ['string', 'char'], style: { color: '#15803d' } },
    { types: ['function', 'tag'], style: { color: '#0369a1' } },
    { types: ['attr-name', 'property'], style: { color: '#b45309' } },
    { types: ['number', 'boolean'], style: { color: '#c2410c' } },
    { types: ['punctuation', 'operator'], style: { color: '#475569' } },
  ],
}

export interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  /** Hide the copy affordance for short inline-ish samples. */
  copyable?: boolean
}

export function CodeBlock({
  code,
  language = 'tsx',
  className,
  copyable = true,
}: CodeBlockProps) {
  const { resolved } = useTheme()
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be denied; the code is still selectable by hand.
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-surface border border-border bg-muted/40',
        className,
      )}
    >
      {copyable && (
        <button
          type="button"
          onClick={copy}
          className={cn(
            'absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center',
            'rounded-control border border-border bg-card text-muted-foreground',
            'cursor-pointer transition-colors duration-150 hover:text-foreground',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {copied ? (
            <Check aria-hidden="true" className="size-3.5 text-success" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          <span className="sr-only">{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      )}
      {/* Wide samples scroll inside the block; the page itself must never
          scroll sideways. */}
      <div className="overflow-x-auto">
        <Highlight
          code={code.trim()}
          language={language}
          theme={resolved === 'dark' ? darkTheme : lightTheme}
        >
          {({ className: preClass, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(preClass, 'p-4 font-mono text-[13px] leading-relaxed')}
              style={style}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line })
                return (
                  <div key={i} {...lineProps}>
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token })
                      return <span key={key} {...tokenProps} />
                    })}
                  </div>
                )
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}
