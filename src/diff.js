import * as _ from './util'
import patch from './patch'
import listDiff from 'list-diff2'

export default function diff(oldTree, newTree) {
  let index = 0
  let patches = {}
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

function dfsWalk(oldNode, newNode, index, patches) {
  let currentPatch = []

  // node is removed
  if (newNode === null) {
    // will be removed when perform reordering, so has no needs to do anthings in here
  // textNode content replacing
  } else if (_.isString(oldNode) && _.isString(newNode)) {
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode })
    }
  // nodes are the same, diff its props and children
  } else if (
      oldNode.tagName === newNode.tagName &&
      oldNode.key === newNode.key
    ) {
    // diff props
    let propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches })
    }
    // diff children
    diffChildren(oldNode.children, newNode.children, index, patches, currentPatch)
  // nodes are not the same, replace the old node with new node
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  let diffs = listDiff(oldChildren, newChildren, 'key')
  newChildren = diffs.children

  if (diffs.moves.length) {
    let reorderPatch = { type: patch.REORDER, moves: diffs.moves }
    currentPatch.push(reorderPatch)
  }

  let leftNode = null
  let currentNodeIndex = index
  _.each(oldChildren, (child, i) => {
    let newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches)
    leftNode = child
  })
}

function diffProps(oldNode, newNode) {
  let count = 0
  let oldProps = oldNode.props
  let newProps = newNode.props

  let key, value
  let propsPatches = {}

  // find out different properties
  for (key in oldProps) {
    value = oldProps[key]
    if (newProps[key] !== value) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // find out new property
  for (key in newProps) {
    value = newProps[key]
    if (!oldProps.hasOwnProperty(key)) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // if properties all are identical
  if (count === 0) {
    return null
  }

  return propsPatches
}

