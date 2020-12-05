// taken from vue's runtime-dom

import { ViewBase } from '@nativescript/core'
import {
  BaseTransition,
  BaseTransitionProps,
  h,
  warn,
  FunctionalComponent,
} from '@vue/runtime-core'
import { isObject, toNumber, extend } from '@vue/shared'
import { NSVElement } from '..'

const TRANSITION = 'transition'
const ANIMATION = 'animation'

export interface TransitionProps extends BaseTransitionProps<NSVElement> {
  name?: string
  type?: typeof TRANSITION | typeof ANIMATION
  css?: boolean
  duration?: number | { enter: number; leave: number }
  // custom transition classes
  enterFromClass?: string
  enterActiveClass?: string
  enterToClass?: string
  appearFromClass?: string
  appearActiveClass?: string
  appearToClass?: string
  leaveFromClass?: string
  leaveActiveClass?: string
  leaveToClass?: string
}

// DOM Transition is a higher-order-component based on the platform-agnostic
// base Transition component, with DOM-specific logic.
export const Transition: FunctionalComponent<TransitionProps> = (
  props,
  { slots }
) => {
  const newProps = resolveTransitionProps(props)
  return h(BaseTransition, newProps, slots)
}

Transition.displayName = 'Transition'

const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true,
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String,
}

export const TransitionPropsValidators = (Transition.props = /*#__PURE__*/ extend(
  {},
  (BaseTransition as any).props,
  DOMTransitionPropsValidators
))

export function resolveTransitionProps(
  rawProps: TransitionProps
): BaseTransitionProps<NSVElement> {
  let {
    name = 'v',
    type,
    css = true,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`,
  } = rawProps

  const baseProps: BaseTransitionProps<NSVElement> = {}
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      ;(baseProps as any)[key] = (rawProps as any)[key]
    }
  }

  if (!css) {
    return baseProps
  }

  const durations = normalizeDuration(duration)
  const enterDuration = durations && durations[0]
  const leaveDuration = durations && durations[1]
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled,
  } = baseProps

  const finishEnter = (
    el: NSVElement,
    isAppear: boolean,
    done?: () => void
  ) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass)
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass)
    done && done()
  }

  const finishLeave = (el: NSVElement, done?: () => void) => {
    removeTransitionClass(el, leaveToClass)
    removeTransitionClass(el, leaveActiveClass)
    done && done()
  }

  const makeEnterHook = (isAppear: boolean) => {
    return (el: NSVElement, done: () => void) => {
      const hook = isAppear ? onAppear : onEnter
      const resolve = () => finishEnter(el, isAppear, done)
      hook && hook(el, resolve)
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass)
        addTransitionClass(el, isAppear ? appearToClass : enterToClass)
        if (!(hook && hook.length > 1)) {
          whenTransitionEnds(el, type, enterDuration, resolve)
        }
      })
    }
  }

  return extend(baseProps, {
    onBeforeEnter(el) {
      onBeforeEnter && onBeforeEnter(el)
      addTransitionClass(el, enterActiveClass)
      addTransitionClass(el, enterFromClass)
    },
    onBeforeAppear(el) {
      onBeforeAppear && onBeforeAppear(el)
      addTransitionClass(el, appearActiveClass)
      addTransitionClass(el, appearFromClass)
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      const resolve = () => finishLeave(el, done)
      addTransitionClass(el, leaveActiveClass)
      addTransitionClass(el, leaveFromClass)
      nextFrame(() => {
        removeTransitionClass(el, leaveFromClass)
        addTransitionClass(el, leaveToClass)
        if (!(onLeave && onLeave.length > 1)) {
          whenTransitionEnds(el, type, leaveDuration, resolve)
        }
      })
      onLeave && onLeave(el, resolve)
    },
    onEnterCancelled(el) {
      finishEnter(el, false)
      onEnterCancelled && onEnterCancelled(el)
    },
    onAppearCancelled(el) {
      finishEnter(el, true)
      onAppearCancelled && onAppearCancelled(el)
    },
    onLeaveCancelled(el) {
      finishLeave(el)
      onLeaveCancelled && onLeaveCancelled(el)
    },
  } as BaseTransitionProps<NSVElement>)
}

function normalizeDuration(
  duration: TransitionProps['duration']
): [number, number] | null {
  if (duration == null) {
    return null
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)]
  } else {
    const n = NumberOf(duration)
    return [n, n]
  }
}

function NumberOf(val: unknown): number {
  const res = toNumber(val)
  if (__DEV__) validateDuration(res)
  return res
}

function validateDuration(val: unknown) {
  if (typeof val !== 'number') {
    warn(
      `<transition> explicit duration is not a valid number - ` +
        `got ${JSON.stringify(val)}.`
    )
  } else if (isNaN(val)) {
    warn(
      `<transition> explicit duration is NaN - ` +
        'the duration expression might be incorrect.'
    )
  }
}

export interface NSVElementWithTransition extends NSVElement {
  // _vtc = Vue Transition Classes.
  // Store the temporarily-added transition classes on the element
  // so that we can avoid overwriting them if the element's class is patched
  // during the transition.
  _vtc?: Set<string>
}

export function addTransitionClass(el: NSVElement, cls: string) {
  const view: ViewBase = el.nativeView

  const addClass = (c: string) => {
    const classes = new Set(view.className.split(' '))
    classes.add(c)
    view.className = Array.from(classes).join(' ')
  }

  cls.split(/\s+/).forEach((c) => c && addClass(c))
  ;(
    (el as NSVElementWithTransition)._vtc ||
    ((el as NSVElementWithTransition)._vtc = new Set())
  ).add(cls)
}

export function removeTransitionClass(el: NSVElement, cls: string) {
  const view: ViewBase = el.nativeView

  const removeClass = (c: string) => {
    const classes = new Set(view.className.split(' '))
    classes.delete(c)
    view.className = Array.from(classes).join(' ')
  }

  cls.split(/\s+/).forEach((c) => c && removeClass(c))
  const { _vtc } = el as NSVElementWithTransition
  if (_vtc) {
    _vtc.delete(cls)
    if (!_vtc!.size) {
      ;(el as NSVElementWithTransition)._vtc = undefined
    }
  }
}

function nextFrame(cb: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb)
  })
}

let endId = 0

function whenTransitionEnds(
  el: NSVElement & { _endId?: number },
  _expectedType: TransitionProps['type'] | undefined,
  explicitTimeout: number | null,
  resolve: () => void
) {
  const id = (el._endId = ++endId)
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve()
    }
  }

  // hack to take the duration/delay directly from nativeView
  // if it's not set.
  if (!explicitTimeout) {
    explicitTimeout =
      css_time_to_milliseconds(el.nativeView.animationDuration) +
      css_time_to_milliseconds(el.nativeView.animationDelay)
  }

  setTimeout(resolveIfNotStale, explicitTimeout)
}

// from: https://gist.github.com/jakebellacera/9261266
function css_time_to_milliseconds(time_string: string) {
  try {
    let num = parseFloat(time_string),
      matches = time_string.match(/m?s/),
      milliseconds,
      unit

    if (matches) {
      unit = matches[0]
    }

    switch (unit) {
      case 's': // seconds
        milliseconds = num * 1000
        break
      case 'ms': // milliseconds
        milliseconds = num
        break
      default:
        milliseconds = 0
        break
    }

    return milliseconds
  } catch {
    return 0
  }
}
