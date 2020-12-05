import {
  NodeTransform,
  NodeTypes,
  createSimpleExpression,
  findProp,
  AttributeNode,
} from '@vue/compiler-core'

// TODO: find out if this is the right way of doing this.
export const transformFor: NodeTransform = (node, _context) => {
  if (node.type !== NodeTypes.ELEMENT) return

  const forProp = findProp(node, 'for')
  if (!forProp) return

  const forValue = (forProp as AttributeNode).value
  if (!forValue) return

  const parsedResult = parseFor(forValue.content)
  if (!parsedResult) return

  node.props.push({
    type: NodeTypes.DIRECTIVE,
    name: `bind`,
    arg: createSimpleExpression('items', true, forProp.loc),
    // TODO: find out if this is how to do this (_ctx...)
    exp: createSimpleExpression(`_ctx.${parsedResult.for}`, false, forProp.loc),
    modifiers: [],
    loc: forProp.loc,
  })

  node.props.push({
    type: NodeTypes.ATTRIBUTE,
    name: '+alias',
    value: {
      content: parsedResult.alias,
      type: NodeTypes.TEXT,
      loc: forProp.loc,
    },
    loc: forProp.loc,
  })

  if (parsedResult.iterator1) {
    node.props.push({
      type: NodeTypes.ATTRIBUTE,
      name: '+index',
      value: {
        content: parsedResult.iterator1,
        type: NodeTypes.TEXT,
        loc: forProp.loc,
      },
      loc: forProp.loc,
    })
  }
}

// taken (and modified) from:
// https://github.com/vuejs/vue/blob/4f81b5db9ab553ca0abe0706ac55ceb861344330/src/compiler/parser/index.js
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
const stripParensRE = /^\(|\)$/g
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/

type ForParseResult = {
  for: string
  alias: string
  iterator1?: string
  iterator2?: string
}

function parseFor(exp: string): ForParseResult | undefined {
  const inMatch = exp.match(forAliasRE)
  if (!inMatch) return

  const alias = inMatch[1].trim().replace(stripParensRE, '')
  const res: ForParseResult = {
    for: inMatch[2].trim(),
    alias,
  }
  const iteratorMatch = alias.match(forIteratorRE)
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim()
    res.iterator1 = iteratorMatch[1].trim()
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim()
    }
  } else {
    res.alias = alias
  }

  return res
}
