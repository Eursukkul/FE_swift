import { useFlagForm } from '../use-flag-form'
import { MetadataSection } from './metadata-section'
import { TargetingSection } from './targeting/targeting-section'

export function FlagEditor() {
  const form = useFlagForm()

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="grid gap-5"
    >
      <MetadataSection form={form} />
      <TargetingSection form={form} />
    </form>
  )
}
