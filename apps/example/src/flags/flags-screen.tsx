import {FLAG_CODES, type FlagCode} from '@hzblj/expo-flags-kit'
import {Box, EmptyState, Island, RnFlatList, RnText, SegmentedControl} from '@hzblj/kara-ui'
import {Stack} from 'expo-router'
import {useCallback, useMemo, useState} from 'react'
import {type ListRenderItem, useWindowDimensions} from 'react-native'

import {Lead} from '../ui'
import {type FlagEntry, flagEntries, searchFlags} from './entries'
import {FlagCell, FlagRow, RowDivider} from './flag-items'
import {FlagSheet} from './flag-sheet'

const LAYOUTS = ['List', 'Grid'] as const

type Layout = (typeof LAYOUTS)[number]

const COLUMNS = 4
/** The page's side padding (`s20`), twice: what is left is shared by the grid's columns. */
const GUTTERS = 40

const keyOf = (entry: FlagEntry) => entry.code

/** Every flag, searchable by name or code, as a list or a grid; a tap opens it in a sheet. */
export const FlagsScreen = () => {
  const {width} = useWindowDimensions()
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState<Layout>('List')
  const [sheet, setSheet] = useState<{code: FlagCode; visible: boolean}>()
  const entries = useMemo(flagEntries, [])
  const found = useMemo(() => searchFlags(entries, query), [entries, query])
  const cell = Math.floor((width - GUTTERS) / COLUMNS)

  const open = useCallback((code: FlagCode) => setSheet({code, visible: true}), [])
  // The code stays while the sheet slides away, so its content does not empty on the way out.
  const dismiss = useCallback(() => setSheet(current => current && {...current, visible: false}), [])

  const renderRow = useCallback<ListRenderItem<FlagEntry>>(
    ({index, item}) => <FlagRow entry={item} first={index === 0} last={index === found.length - 1} onPress={open} />,
    [found.length, open]
  )
  const renderCell = useCallback<ListRenderItem<FlagEntry>>(
    ({item}) => <FlagCell entry={item} onPress={open} width={cell} />,
    [cell, open]
  )

  return (
    <>
      <Stack.SearchBar
        autoCapitalize="none"
        hideWhenScrolling={false}
        onChangeText={event => setQuery(event.nativeEvent.text)}
        placeholder="Name or code"
      />
      <RnFlatList
        ItemSeparatorComponent={layout === 'List' ? RowDivider : undefined}
        ListEmptyComponent={
          <Island>
            <EmptyState
              description={`Nothing is called “${query.trim()}”, and no code starts with it.`}
              icon="search"
              title="No flag"
            />
          </Island>
        }
        ListHeaderComponent={
          <Box gap="s16" pb="s16">
            {query.trim() === '' ? (
              <Lead>
                {`All ${FLAG_CODES.length} flags of FlagKit, each a native vector view: an image from an asset catalog on iOS, a VectorDrawable on Android. Search by name or code, and tap a flag for the rest.`}
              </Lead>
            ) : (
              <RnText color="content.secondary" variant="footnote">
                {`${found.length} of ${FLAG_CODES.length} flags`}
              </RnText>
            )}
            <SegmentedControl
              onChange={index => setLayout(LAYOUTS[index] ?? 'List')}
              selectedIndex={LAYOUTS.indexOf(layout)}
              values={[...LAYOUTS]}
            />
          </Box>
        }
        bg="surface.base"
        content={{pb: 's80', pt: 's8', px: 's20'}}
        contentInsetAdjustmentBehavior="automatic"
        data={found}
        flex={1}
        initialNumToRender={layout === 'List' ? 16 : 28}
        keyExtractor={keyOf}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        // Changing the column count needs a new list.
        key={layout}
        numColumns={layout === 'List' ? 1 : COLUMNS}
        renderItem={layout === 'List' ? renderRow : renderCell}
      />
      {sheet ? <FlagSheet code={sheet.code} onDismiss={dismiss} visible={sheet.visible} /> : null}
    </>
  )
}
