import {Lead, Page} from '../ui'
import {Accessibility} from './accessibility'
import {CodeList} from './code-list'
import {Emoji} from './emoji'
import {Names} from './names'
import {ToFlagCode} from './to-flag-code'

/** The helpers: codes from outside, names in any language, emoji, what screen readers hear, the code list. */
export const CodesScreen = () => (
  <Page>
    <Lead>
      Typed codes and a guard for the ones that come from outside, names in any language, emoji for text, and flags that
      screen readers skip or announce.
    </Lead>
    <ToFlagCode />
    <Names />
    <Emoji />
    <Accessibility />
    <CodeList />
  </Page>
)
