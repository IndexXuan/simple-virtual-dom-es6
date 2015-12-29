/**
File   : usage.js
Author : IndexXuan(https://github.com/IndexXuan)
Mail   : indexxuan@gmail.com
Date   : 2015年12月29日 星期二 08时30分45秒
*/

import { el, diff, patch } from './vdom'

let count = 0
function renderTree() {
  count++
  let items = []
  let color = (count % 2 === 0)
    ? 'blue'
    : 'red'
  for (let i = 0; i < count; i++) {
    items.push(el('li', ['Item #' + i]))
  }
  return el('div', {'id': 'container'}, [
    el('h1', {style: 'color: ' + color}, ['simple virtal dom']),
    el('p', ['the count is :' + count]),
    el('ul', items)
  ])
}
let tree = renderTree()
let root = tree.render()
document.body.appendChild(root)
setInterval(function() {
  let newTree = renderTree()
  let patches = diff(tree, newTree)
  console.log(patches)
  patch(root, patches)
  tree = newTree
}, 1000)
