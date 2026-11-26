// Named import: the package has no `exports` map, so SSR loads its CJS build where `default` is the module object.
import { Editor } from '@monaco-editor/react'
import { Check, CircleAlert, CircleCheck, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

import { describePath } from '../../model/describe-path'
import { flagFormSchema } from '../../model/schema'
import { toOutput } from '../../model/to-output'
import { asFlagValues } from '../../use-flag-form'
import type { FlagForm } from '../../use-flag-form'

const EDITOR_THEME = 'flag-preview'

const EDITOR_OPTIONS = {
  readOnly: true,
  domReadOnly: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  tabSize: 2,
  wordWrap: 'on',
  automaticLayout: true,
  renderLineHighlight: 'none',
} as const

/** Matches the inline errors, which also show only the first issue of a field. */
function firstIssuePerField<T extends { path: ReadonlyArray<PropertyKey> }>(
  issues: ReadonlyArray<T>,
) {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    const key = issue.path.map(String).join('.')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Live view of the output JSON; it is the only part of the editor that subscribes to every value. */
export function JsonPreview({ form }: { form: FlagForm }) {
  return (
    <form.Subscribe selector={(state) => state.values}>
      {(data) => {
        const values = asFlagValues(data)
        const json = JSON.stringify(toOutput(values), null, 2)
        const result = flagFormSchema.safeParse(values)
        const issues = result.success
          ? []
          : firstIssuePerField(result.error.issues)

        return (
          <section
            aria-label="JSON preview"
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-sm"
          >
            <header className="flex items-center gap-3 border-b border-slate-800 px-4 py-2.5">
              <span className="font-mono text-xs text-slate-400">
                flags.json
              </span>
              <StatusBadge issueCount={issues.length} />
              <CopyButton text={json} />
            </header>

            <Editor
              height="min(60vh, 34rem)"
              language="json"
              theme={EDITOR_THEME}
              beforeMount={(monaco) =>
                monaco.editor.defineTheme(EDITOR_THEME, {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  // Tailwind slate-950, the panel's background.
                  colors: { 'editor.background': '#020617' },
                })
              }
              value={json}
              options={EDITOR_OPTIONS}
              loading={
                <pre className="p-4 font-mono text-xs text-slate-400">
                  Loading editor…
                </pre>
              }
            />

            {issues.length > 0 && (
              <ul
                aria-label="Issues"
                className="grid max-h-48 gap-1.5 overflow-y-auto border-t border-slate-800 px-4 py-3 text-xs"
              >
                {issues.map((issue, index) => (
                  <li key={index} className="flex gap-2">
                    <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-red-400" />
                    <span>
                      <span className="font-medium text-slate-200">
                        {describePath(issue.path)}
                      </span>
                      <span className="text-slate-400"> — {issue.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      }}
    </form.Subscribe>
  )
}

function StatusBadge({ issueCount }: { issueCount: number }) {
  const valid = issueCount === 0
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        valid
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-red-500/15 text-red-300',
      )}
    >
      {valid ? (
        <CircleCheck className="size-3.5" />
      ) : (
        <CircleAlert className="size-3.5" />
      )}
      {valid
        ? 'Valid'
        : `${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      size="xs"
      variant="ghost"
      className="ml-auto text-slate-300 hover:bg-slate-800 hover:text-slate-100"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => setCopied(true))
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}
