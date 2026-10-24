import type {FlagCode} from '@hzblj/expo-flags-kit'
import {useState} from 'react'

import {Lead, Page} from '../ui'
import {ContentFit} from './content-fit'
import {FlagPicker} from './flag-picker'
import {Playground} from './playground'
import {Shapes} from './shapes'
import {FullWidth, Sizes} from './sizes'

/** Sizes, shapes and fits, every one with plain styles, on a flag you pick. */
export const StylesScreen = () => {
  const [code, setCode] = useState<FlagCode>('CZ')

  return (
    <Page>
      <Lead>
        A flag is a plain view: a width or a height sizes it, styles shape it, contentFit says how it fills a box of
        another shape.
      </Lead>
      <FlagPicker onChange={setCode} value={code} />
      <Sizes code={code} />
      <FullWidth code={code} />
      <Shapes code={code} />
      <ContentFit code={code} />
      <Playground code={code} />
    </Page>
  )
}
