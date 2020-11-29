import { BottomNavigation } from 'nativescript-vue'

export default {
  components: {
    BottomNavigation,
  },
  template: `
<GridLayout rows="auto, auto, *" class="spacing-top">
  <Label class="h2" :text="tabText" row="0"/>
  <Button class="-outline" text="Go last" @tap="activeTab = tabs.length - 1" row="1" />

  <ContentView row="2">
    <BottomNavigation v-model="activeTab">
      <TabStrip>
        <TabStripItem
          v-for="(tab, i) in tabs"
          :key="i + tab.title"
          :title="tab.title">
        </TabStripItem>
      </TabStrip>
      <TabContentItem
        v-for="(tab, i) in tabs"
        :key="i + tab.title">
        <GridLayout>
          <Label class="h1" :text="tab.text" />
        </GridLayout>
      </TabContentItem>
    </BottomNavigation>
  </ContentView>
</GridLayout>`,
  data() {
    return {
      activeTab: 0,
      tabs: [
        { title: 'First Tab', text: "We're the first tab!" },
        { title: 'Second Tab', text: "We're the second tab!" },
        { title: 'Third Tab', text: "We're the third tab!" },
      ],
    }
  },
  computed: {
    tabText() {
      return `Tab: ${this.activeTab}`
    },
  },
  mounted() {},
}
