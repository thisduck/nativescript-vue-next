<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <StackLayout>
      <Button class="-outline" text="Counter App" @tap="$navigateTo(Counter)" />
      <Button class="-outline" text="Composition Counter App" @tap="$navigateTo(CompositionCounter)" />
    </StackLayout>
  </Page>
</template>

<script>
import Counter from './Counter'
import CompositionCounter from './CompositionCounter'

export default {
  data() {
    return {
      Counter,
      CompositionCounter
    }
  },
}
</script>

<style scoped lang="scss">
@import '~@nativescript/theme/scss/variables/blue';
</style>
