import {
  NodeTransform,
  NodeTypes,
  createSimpleExpression,
  processExpression,
  transformElement,
  trackSlotScopes,
  findProp,
  ElementNode,
  AttributeNode,
} from '@vue/compiler-core'

// TODO: find out if this is the right way of doing this.
export const transformVTemplate: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.ELEMENT && node.tag == 'v-template') {
    const { alias, index } = getAliasAndIndex(context.parent as ElementNode)

    node.props.push({
      type: NodeTypes.DIRECTIVE,
      name: `slot`,
      arg: undefined,
      exp: processExpression(
        createSimpleExpression(
          `{ ${alias}, ${index}, $even, $odd }`,
          false,
          node.loc
        ),
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

function getAliasAndIndex(parentNode: ElementNode | undefined) {
  let alias = 'item'
  let index = '$index'

  if (parentNode) {
    const aliasProp = findProp(parentNode, '+alias')
    const indexProp = findProp(parentNode, '+index')

    if (aliasProp) {
      const value = (aliasProp as AttributeNode).value
      alias = value ? value.content : alias
    }

    if (indexProp) {
      const value = (indexProp as AttributeNode).value
      index = value ? value.content : index
    }
  }

  return { alias, index }
}
