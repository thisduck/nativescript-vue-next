<template>
  <Page>
    <ActionBar>
      <Label text="Counter App" />
    </ActionBar>

    <StackLayout>
      <Label class="h2 p-y-2 m-b-2" :text="counter" />
      <Button class="-outline" @tap="counter++">Add 1</Button>
      <Button class="-outline" @tap="counter--">Subtract 1</Button>
    </StackLayout>
  </Page>
</template>

<script>
import { defineComponent } from 'nativescript-vue'

export default defineComponent({
  data() {
    return {
      counter: 0,
    }
  },
})
</script>

<style lang="scss">
Label {
  text-align: center;
}
</style>
