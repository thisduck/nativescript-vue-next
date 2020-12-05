<template>
  <Page>
    <ListView for="(thing, i) in items2" @itemTap="onItemTap">
      <v-template>
        <GridLayout columns="*, auto ">
          <Label textWrap="true"> {{ thing.number }} - {{ thing.text }} </Label>
          <Button
            col="1"
            :text="'tap ' + i"
            @tap="onTestTap(thing.text, i, $even, $odd)"
          />
        </GridLayout>
      </v-template>
      <v-template name="other" if="$odd">
        <Label>Odd - {{ i }} - {{ thing.number }}</Label>
      </v-template>
    </ListView>
  </Page>
</template>

<script>
import { defineComponent } from 'nativescript-vue'

const randomText = () => {
  let length = Math.floor(Math.random() * 200) + 20
  let result = ''
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export default defineComponent({
  data() {
    return {
      items2: [
        ...Array(200)
          .fill('')
          .map((item, index) => ({ number: index, text: randomText() })),
      ],
      items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4',
        'Item 5',
        'Item 6',
        'Item 7',
        'Item 8',
        'Item 9',
        'Item 10',
        'Item 11',
        'Item 12',
        'Item 13',
        'Item 14',
        'Item 15',
        'Item 16',
        'Item 17',
        'Item 18',
        'Item 19',
      ],
    }
  },
  methods: {
    onItemTap(event) {
      console.log(`Tapped ${event.item}`)
      alert(event.item.text)
    },
    onTestTap(item, index, even, odd) {
      alert(`Test tap ${index}! (${item}, ${index}, ${even}, ${odd})`)
      console.log(`Test tap ${index}! (${item}, ${index}, ${even}, ${odd})`)
    },
  },
})
</script>

<style lang="scss">
Label {
  text-align: center;
}
</style>
