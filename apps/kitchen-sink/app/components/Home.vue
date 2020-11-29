<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <StackLayout>
      <Button class="-outline" text="Counter App" @tap="$navigateTo(Counter)" />
    </StackLayout>
  </Page>
</template>

<script>
import Counter from './Counter'

export default {
  data() {
    return {
      Counter,
    }
  },
}
</script>

<style scoped lang="scss">
@import '~@nativescript/theme/scss/variables/blue';
</style>
