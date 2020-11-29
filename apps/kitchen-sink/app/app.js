import { createApp, h } from 'nativescript-vue'

import Home from './pages/Home'

createApp({
  render: () => h('frame', [h(Home)]),
}).start()
