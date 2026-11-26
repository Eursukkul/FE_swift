import Header from '#/components/features/header'
import { FlagEditor } from './components/flag-editor'

function YourCode() {
  return (
    <section>
      <Header
        title="Feature Flag Editor"
        subTitle="Configure a flag, its variations and targeting rules."
      />
      <FlagEditor />
    </section>
  )
}

export default YourCode
