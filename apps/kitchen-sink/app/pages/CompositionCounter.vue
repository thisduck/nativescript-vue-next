<template>
  <Page>
    <ActionBar>
      <Label text="Composition Counter App" />
    </ActionBar>

    <StackLayout>
      <Label class="h2 p-y-2 m-b-2" :text="counter" />
      <Button class="-outline" @tap="add">Add 1</Button>
      <Button class="-outline" @tap="subtract">Subtract 2</Button>
    </StackLayout>
  </Page>
</template>

<script>
import { defineComponent, ref } from 'nativescript-vue'

export default defineComponent({
  setup() {
    const counter = ref(0)

    const add = () => {
      counter.value++
    }

    const subtract = () => {
      counter.value -= 2
    }

    return {
      add,
      subtract,
      counter
    }
  },
})
</script>

<style lang="scss">
Label {
  text-align: center;
}
</style>
