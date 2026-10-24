import {Tabs} from '@hzblj/kara-ui/router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen icon="flag" name="(flags)" selectedIcon="flag-filled" title="Flags" />
      <Tabs.Screen icon="category" name="styles" selectedIcon="category-filled" title="Styles" />
      <Tabs.Screen icon="pin" name="codes" selectedIcon="pin-filled" title="Codes" />
    </Tabs>
  )
}
