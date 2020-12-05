<template>
  <Page>
    <ActionBar>
      <Label text="Transition" />
    </ActionBar>

    <StackLayout>
      <Button class="" @tap="toggle">Toggle</Button>
      <Transition name="bounce">
        <Label
          ref="label"
          class="h2 p-y-2 m-b-2"
          :text="message"
          v-show="show"
        />
      </Transition>
    </StackLayout>
  </Page>
</template>

<style lang="scss" scoped>
.bounce-enter-active {
  animation-name: bounce-in;
  animation-duration: 0.5s;
}
.bounce-leave-active {
  animation-name: bounce-in;
  animation-duration: 0.5s;
  animation-direction: reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>

<script>
import { defineComponent, ref } from 'nativescript-vue'

export default defineComponent({
  setup() {
    const show = ref(true)
    const label = ref(null)

    const toggle = (event) => {
      show.value = !show.value
    }

    const message = 'Teeheehee.'

    return {
      show,
      toggle,
      message,
      label,
    }
  },
})
</script>

