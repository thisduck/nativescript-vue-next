<template>
  <Page>
    <ActionBar>
      <Label text="BottomNavigation" />
    </ActionBar>

    <BottomNavigationComponent />
  </Page>
</template>

<script>
// TODO: Verify if component named the same as the current component should work or not.
import BottomNavigationComponent from '../components/BottomNavigation'

export default {
  components: {
    BottomNavigationComponent,
  },
}
</script>
