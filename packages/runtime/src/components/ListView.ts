import {
  h,
  onMounted,
  defineComponent,
  inject,
  provide,
  ref,
  Ref,
} from '@vue/runtime-core'
import {
  INSVElement,
  nodeOps,
  NSVRoot,
  render,
} from '@nativescript-vue/runtime'
import { ItemEventData, View } from '@nativescript/core'
// import { debug } from '@nativescript-vue/shared'

const TemplatesBagSymbol = Symbol()
const isListViewRealizedSymbol = Symbol()
const NSV_LVR_REF = Symbol('NSV_LVR_REF')

interface ListViewRealized {
  [isListViewRealizedSymbol]: true
  container: NSVRoot | null
}

export const ListItemTemplate = defineComponent({
  props: {
    name: {
      type: String,
    },
    if: {
      type: String,
    },
  },
  setup(props, { slots }) {
    let tid = 0
    onMounted(() => {
      if (!slots.default) return

      const templates: TemplateBag | undefined = inject(TemplatesBagSymbol)
      if (!templates) return

      templates.registerTemplate(
        props.name || (props.if ? `v-template-${tid++}` : 'default'),
        props.if,
        slots.default
      )
    })

    return () => {}
  },
})

export class TemplateBag {
  _templateMap: Map<
    string,
    {
      scopedFn: Function
      conditionFn: Function
      keyedTemplate: VueKeyedTemplate
    }
  > = new Map()

  registerTemplate(
    name: string,
    condition: string | undefined,
    scopedFn: Function
  ) {
    this._templateMap.set(name, {
      scopedFn,
      conditionFn: this.getConditionFn(condition),
      keyedTemplate: new VueKeyedTemplate(name, scopedFn),
    })
  }

  getConditionFn(condition: string | undefined) {
    return new Function('ctx', `with(ctx) { return !!(${condition}) }`)
  }

  getAvailable() {
    return Array.from(this._templateMap.keys())
  }

  getKeyedTemplates() {
    return Array.from(this._templateMap.values()).map(
      ({ keyedTemplate }) => keyedTemplate
    )
  }

  getKeyedTemplate(name: string) {
    let template
    if ((template = this._templateMap.get(name))) {
      return template.keyedTemplate
    }
  }

  get selectorFn() {
    let self = this
    return function templateSelectorFn(item: any) {
      const iterator = self._templateMap.entries()
      let curr
      while ((curr = iterator.next().value)) {
        const [name, { conditionFn }] = curr
        try {
          if (conditionFn(item)) {
            return name
          }
        } catch (err) {}
      }
      return 'default'
    }
  }

  patchTemplate(name: string, context: any, oldVnode: View | undefined) {
    let template = this._templateMap.get(name)
    if (!template) {
      return
    }

    let vnode = template.scopedFn(context)[0]

    if (!oldVnode) {
      ;(oldVnode as unknown) = {
        [isListViewRealizedSymbol]: true,
        container: null,
      }
    }

    let view
    if ((oldVnode as any)[isListViewRealizedSymbol]) {
      // it is an initial render into this view holder
      const lvr = (oldVnode as unknown) as ListViewRealized
      // lets create an initial root
      lvr.container = nodeOps.createRoot()

      render(vnode, lvr.container)

      if (lvr.container.el) {
        lvr.container.el.nativeView[NSV_LVR_REF] = lvr
        view = lvr.container.el.nativeView
      }
    } else {
      const lvr = (oldVnode as any)[NSV_LVR_REF] as ListViewRealized
      render(vnode, lvr.container!)
      view = lvr.container!.el!.nativeView
    }

    // force flush Vue callbacks so all changes are applied immediately
    // rather than on next tick
    // flushCallbacks()

    return view
  }
}

export class VueKeyedTemplate /* implements KeyedTemplate */ {
  _key: string
  _scopedFn: Function

  constructor(key: string, scopedFn: Function) {
    this._key = key
    this._scopedFn = scopedFn
  }

  get key() {
    return this._key
  }

  createView(): ListViewRealized {
    return {
      [isListViewRealizedSymbol]: true,
      container: null,
    }
  }
}

export const ListView = defineComponent({
  props: {
    items: {
      type: Array,
      required: true,
    },
    '+index': {
      type: String,
      default: '$index',
    },
    '+alias': {
      type: String,
      default: 'item',
    },
  },
  emits: ['itemTap'],
  setup(props, ctx) {
    const templates = new TemplateBag()
    const listViewRef: Ref<INSVElement | null> = ref(null)
    provide(TemplatesBagSymbol, templates)

    const getItemContext = (item: any, index: number) => ({
      [props['+alias']]: item,
      [props['+index']]: index,
      $even: index % 2 === 0,
      $odd: index % 2 !== 0,
    })

    onMounted(() => {
      const listView: INSVElement | null = listViewRef.value
      if (!listView) return

      listView.setAttribute('itemTemplates', templates.getKeyedTemplates())
      listView.setAttribute('itemTemplateSelector', (item: any, index: any) => {
        return templates.selectorFn(getItemContext(item, index))
      })
    })

    return () => {
      return h(
        'InternalListView',
        {
          ref: listViewRef,
          items: props.items,
          onitemTap: (args: ItemEventData) => {
            ctx.emit('itemTap', {
              ...args,
              item: props.items[args.index],
            })
          },
          onitemLoading(args: ItemEventData) {
            const item = props.items[args.index]
            const name = (args.object as any)._itemTemplateSelector(
              item,
              args.index,
              props.items
            )
            args.view = templates.patchTemplate(
              name,
              getItemContext(item, args.index),
              args.view
            )
          },
        },
        ctx.slots
      )
    }
  },
})
