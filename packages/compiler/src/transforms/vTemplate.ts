import {
  NodeTransform,
  NodeTypes,
  createSimpleExpression,
  processExpression,
  transformElement,
  trackSlotScopes,
} from '@vue/compiler-core'

// TODO: find out if this is the right way of doing this.
export const transformVTemplate: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.ELEMENT && node.tag == 'v-template') {
    node.props.push({
      type: NodeTypes.DIRECTIVE,
      name: `slot`,
      arg: undefined,
      exp: processExpression(
        createSimpleExpression('{ item, index, $even, $odd }', false, node.loc),
        context,
        true
      ),
      modifiers: [],
      loc: node.loc,
    })

    transformElement(node, context)
    trackSlotScopes(node, context)
  }
}
