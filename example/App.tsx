import {FLAG_CODES, type FlagCode, FlagView, getFlagEmoji, getFlagName} from '@hzblj/expo-flags-kit'
import {useEffect, useState} from 'react'
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native'

const PAGES = ['grid', 'sizes', 'shapes'] as const

type Page = (typeof PAGES)[number]

const pageFromUrl = (url: string | null): Page | null => {
  const page = url?.replace(/^flagskit:\/\//, '').replace(/\/$/, '')

  return PAGES.find(candidate => candidate === page) ?? null
}

const Grid = () => (
  <View style={styles.grid}>
    {FLAG_CODES.map(code => (
      <View key={code} style={styles.cell}>
        <FlagView code={code} style={styles.gridFlag} />
        <Text numberOfLines={1} style={styles.cellLabel}>
          {code}
        </Text>
      </View>
    ))}
  </View>
)

const SIZES = [16, 21, 42, 84]

const Sizes = () => (
  <ScrollView contentContainerStyle={styles.page}>
    {(['CZ', 'US', 'NP'] as FlagCode[]).map(code => (
      <View key={code} style={styles.row}>
        {SIZES.map(width => (
          <FlagView code={code} key={width} style={{width}} />
        ))}
      </View>
    ))}
    <Text style={styles.caption}>Full width, sized by width only</Text>
    <FlagView accessibilityLabel="Brazil" code="BR" />
    <Text style={styles.caption}>Sized by height only</Text>
    <FlagView code="GB" style={{height: 60}} />
  </ScrollView>
)

const Shapes = () => (
  <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.caption}>contentFit in a square: cover, contain, fill</Text>
    <View style={styles.row}>
      <FlagView code="KR" contentFit="cover" style={styles.square} />
      <FlagView code="KR" contentFit="contain" style={styles.square} />
      <FlagView code="KR" contentFit="fill" style={styles.square} />
    </View>
    <Text style={styles.caption}>borderRadius on the flag itself</Text>
    <View style={styles.row}>
      <FlagView code="JP" style={styles.circle} />
      <FlagView code="DE" style={styles.circle} />
      <FlagView code="BR" style={styles.circle} />
      <FlagView code="GB-SCT" style={styles.rounded} />
    </View>
    <Text style={styles.caption}>Border and radius on the flag itself</Text>
    <View style={styles.row}>
      <FlagView code="JP" style={styles.bordered} />
      <FlagView code="FI" style={styles.bordered} />
      <FlagView code="CZ" style={[styles.bordered, styles.circle]} />
    </View>
    <Text style={styles.caption}>Accessible flags, named by the system</Text>
    <View style={styles.row}>
      <FlagView accessible code="CZ" style={styles.small} testID="flag-cz" />
      <FlagView accessible code="GB-SCT" style={styles.small} testID="flag-gb-sct" />
      <FlagView accessibilityLabel="Language: Czech" code="CZ" style={styles.small} testID="flag-labelled" />
    </View>
    {(['CZ', 'EU', 'XK', 'GB-SCT'] as FlagCode[]).map(code => (
      <Text key={code} style={styles.name}>
        {code}: {getFlagName(code)} / {getFlagName(code, 'cs')} / {getFlagName(code, 'de')}
      </Text>
    ))}
    <Text style={styles.caption}>Emoji</Text>
    <Text style={styles.emoji}>
      {(['CZ', 'EU', 'GB-ENG', 'GB-SCT', 'LGBT', 'XK'] as FlagCode[]).map(code => getFlagEmoji(code)).join(' ')}
    </Text>
  </ScrollView>
)

export const App = () => {
  const [page, setPage] = useState<Page>('grid')

  useEffect(() => {
    Linking.getInitialURL().then(url => setPage(current => pageFromUrl(url) ?? current))

    const subscription = Linking.addEventListener('url', ({url}) => setPage(current => pageFromUrl(url) ?? current))

    return () => subscription.remove()
  }, [])

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {PAGES.map(name => (
          <Pressable key={name} onPress={() => setPage(name)} style={[styles.tab, name === page && styles.activeTab]}>
            <Text style={name === page ? styles.activeTabLabel : styles.tabLabel}>{name}</Text>
          </Pressable>
        ))}
      </View>
      {page === 'grid' ? <Grid /> : page === 'sizes' ? <Sizes /> : <Shapes />}
    </View>
  )
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#111827',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bordered: {
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    width: 84,
  },
  caption: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 20,
  },
  cell: {
    alignItems: 'center',
    marginBottom: 2,
    width: 31,
  },
  cellLabel: {
    color: '#6B7280',
    fontSize: 7,
    marginTop: 1,
  },
  circle: {
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  emoji: {
    fontSize: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gridFlag: {
    width: 28,
  },
  name: {
    color: '#111827',
    fontSize: 13,
    marginBottom: 2,
  },
  page: {
    padding: 16,
  },
  rounded: {
    borderRadius: 10,
    width: 84,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  screen: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingTop: 64,
  },
  small: {
    width: 42,
  },
  square: {
    backgroundColor: '#F3F4F6',
    height: 72,
    width: 72,
  },
  tab: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tabLabel: {
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
})
