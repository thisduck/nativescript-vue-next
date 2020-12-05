<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <ScrollView>
      <ListView for="item in components" @itemTap="gotoComponent">
        <v-template>
          <Label :text="item.name" />
        </v-template>
      </ListView>
    </ScrollView>
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
      components: [
        { component: Counter, name: 'Counter' },
        { component: CompositionCounter, name: 'Composition Counter' },
        { component: BottomNavigation, name: 'Bottom Navigation' },
        { component: ListViewExample, name: 'List View Example' },
      ],
    }
  },
  methods: {
    gotoComponent({ item }) {
      this.$navigateTo(item.component)
    },
  },
}
</script>
