<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <StackLayout>
      <Button class="-outline" text="Counter" @tap="$navigateTo(Counter)" />
      <Button
        class="-outline"
        text="Composition Counter"
        @tap="$navigateTo(CompositionCounter)"
      />
      <Button
        class="-outline"
        text="BottomNavigation"
        @tap="$navigateTo(BottomNavigation)"
      />
      <Button
        class="-outline"
        text="List View Example"
        @tap="$navigateTo(ListViewExample)"
      />
    </StackLayout>
  </Page>
</template>

<script>
import Counter from './Counter'
import CompositionCounter from './CompositionCounter'
import BottomNavigation from './BottomNavigation'
import ListViewExample from './ListViewExample'

export default {
  data() {
    return {
      Counter,
      CompositionCounter,
      BottomNavigation,
      ListViewExample
    }
  },
}
</script>
