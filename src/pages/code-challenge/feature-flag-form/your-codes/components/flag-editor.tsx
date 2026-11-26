import { useFlagForm } from '../use-flag-form'
import { DefaultRuleSection } from './default-rule-section'
import { MetadataSection } from './metadata-section'
import { JsonPreview } from './preview/json-preview'
import { TargetingSection } from './targeting/targeting-section'
import { VariationsSection } from './variations/variations-section'

export function FlagEditor() {
  const form = useFlagForm()

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="grid gap-5"
      >
        <MetadataSection form={form} />
        <VariationsSection form={form} />
        <TargetingSection form={form} />
        <DefaultRuleSection form={form} />
      </form>

      <aside className="xl:sticky xl:top-4">
        <JsonPreview form={form} />
      </aside>
    </div>
  )
}
