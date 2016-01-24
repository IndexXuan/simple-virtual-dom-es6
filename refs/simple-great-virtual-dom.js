/*******************************************************
# File   : simple-great-virtual-dom.js
# Author : IndexXuan(https://github.com/IndexXuan)
# Mail   : indexxuan@gmail.com
# Date   : 2015年12月25日 星期五 22时01分37秒
 ******************************************************/

/**
 *
 * 本文会教你用300-400行代码实现一个Virtual DOM算法并且尽量把Virtual DOM的算法思想阐述清楚
 */

var element = {
  tagName: 'ul',
  props: {
    id: 'list'
  },
  children: [
    {tabName: 'li', props: {class: 'item'}, children: ['Item 1']},
    {tabName: 'li', props: {class: 'item'}, children: ['Item 2']},
    {tabName: 'li', props: {class: 'item'}, children: ['Item 3']},
  ]
}

/*
<ul id="list">
  <li class="item">Item 1</li>
  <li class="item">Item 1</li>
  <li class="item">Item 1</li>
</ul>
*/

/*
 * 既然原来的DOM树信息都可以用js对象来表达，反过来，你就可以根据这个用js对象来表示
 * 树结构来构建一个真正的DOM树
 *
 * 之前的章节所说，状态变更=>重新渲染整个视图的方式可以稍微修改一下，用js对象表示DOM
 * 信息和结构，当状态变更时候，重新渲染这个js对象结构，当然这样做其实没什么用，因为真正
 * 的页面其实没有改变。
 *
 * 但是可以用新渲染的对象树去和旧的树进行比较，记录两棵树的差异，记录下来的不同就是我们
 * 需要对页面进行修改的地方，然后把它们应用到真正的DOM树上，页面就变更了。这样就可以做到
 * 视图的结构确实是全新渲染了，但是最后操作的DOM的时候确实只变更有不同的地方。
 *
 * 算法综述:
 * 1. 用js对象结构表示DOM树结构，然后用这个构建一个真正的DOM树，插入到文档中。
 * 2. 当状态变更的时候，重新构造一颗新的对象树，然后用新的树和旧的树进行比较，
 * 记录两颗树的差异
 * 3. 把上面记录的差异应用到步骤1所构建的真正的DOM树上，视图就更新了。
 *
 * 思想: 缓存，分层
*/

// 实现
// element.js
function Element(tagName, props, children) {
  this.tagName = tagName
  this.props = props
  this.children = children
}

module.exports = function(tabName, props, children) {
  return new Element(tagName, props, children);
}

// usage
var el = require('./element');
var ul = el('ul', {id: 'list'}, [
  el('li', {class: 'item'}, ['Item 1']),
  el('li', {class: 'item'}, ['Item 2']),
  el('li', {class: 'item'}, ['Item 3'])
])

Element.prototype.render = function() {
  var el = document.createElement(this.tagName)
  var props = this.props

  for (var propName in props) {
    var propValue = prop[propName]
    el.setAttribute(propName, propValue)
  }

  var children = this.children || []

  children.forEach(function(child) {
    var childEl = (child instanceof Element)
      ? child.render() 
      : document.createTextNode(child)
    el.appendChild(child)
  })

  return el;
}

var ulRoot = ul.render()
document.body.appendChild(ulRoot)

/* 
 * 步骤二，比较两个虚拟DOM树的差异是Virtual DOM算法最核心的部分，这也是所谓的Virtual DOM
 * 的diff算法。两个树完全的diff算法是一个时间复杂度O(n^3)的问题，但是在前端中，你很少会遇到
 * 跨层级的移动DOM,所以Virtual DOM只会对同一个层级的元素进行对比, 因此算法复杂度达到O(n)
 *
 */

// 深度优先遍历，记录差异
// 实际的代码中，会对新旧两颗树进行一个深度优先的遍历，这样每个节点就会有一个唯一的标记

// diff函数
function diff(oldTree, newTree) {
  var index = 0
  var patches = {}
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

// 对两颗树进行深度优先遍历
function dfsWalk(oldNode, newNode, index, patches) {
  // 对比oldNode和newNode的不同，记录下来
  // patches[index] = [...]
  diffChildren(oldNode.children, newNode.children, index, patches)
}

// 遍历子节点
function diffChildren(oldChldren, newChildren, index, patches) {
  var leftNode = null
  var currentNodeIndex = index
  oldChldren.forEach(function(child, i) {
    var newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count) 
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches)
    leftNode = child
  })
}


// 例如上面的div和新的div有差异，当前标记是0，那么:
// patches[0] = [{defference}, {difference}, ...] // 用数组存储新旧节点的不同

// 差异类型
/**
 * 1. 替换掉原来的节点，例如把div换成了section
 * 2. 移动删除新增子节点，例如上面div的子节点，把p和ul顺序互换
 * 3. 修改了子节点的属性
 * 4. 对于文字节点，文本内容可能会改变，例如修改上面的文本节点
 *

  var REPLACE = 0
  var REORDER = 1 
  var PROPSA = 2
  var TEXT = 3

 */

patches[0] = [{
  type: REPLACE,
  node: newNode // el('section', props, children)
}]

patches[0] = [{
  type: REPLACE,
  ndoe: newNode // el('section', props, children)
}, {
  type: PROPS,
  props: {
    id: "container"
  }
}]

// 对节点插入删除移动，本质上是最小编辑距离问题，最常见的解决算法是Levenshtein Distance
// 算法，通过同态规划求解，时间复杂度为O(m * n), 我们并不需要真的达到最小的操作，我们只
// 需要优化一些常见的移动情况，牺牲一定的DOM操作，让算法复杂度达到线性的O(max(m, n))。具体
// 可以看具体代码。

// 把差异应用到真正的DOM树上
/**
 *
 * 因为步骤一所构建的js对象树和render出来的真正的DOM树信息、结构是一样的。所以我们可以
 * 对那颗DOM树也进行深度优先的遍历，遍历的时候从步骤二生成的patches对象中找到当前遍历的节点
 * 差异，然后进行DOM操作.
 *
 */

function patch(node, patches) {
  var waler = {index: 0}
  dfsWalk(node, waler, patches)
}

function dfsWalk(node, walker, patches) {
  var currentPatches = patches[walker.index] // 从patches拿出当前节点的差异

  var len = node.childNodes
    ? node.childNodes.length
    : 0
  for (var i = 0; i < len ; i++) { // 深度遍历子节点
    var child = node.childNodes[i]
    walker.index++
    dfsWalk(child, walker, patches)
  }

  if (currentPatches) {
    applyPatches(node, currentPatches) // 对当前节点进行DOM操作
  }
}

// 根据不同类型的差异对当前节点进行DOM操作
function applyPatches(node, currentPatches) {
  currentPatches.forEach(function(currentPatch) {
    switch (currentPatch.type) {
      case REPLACE:
        node.parentNode.replaceChild(currentPatch.node.render(), node)
        break
      case REORDER:
        reorderChildren(node, currentPatch.moves)
        break
      case PROPS:
        setProps(ndoe, currentPatch.props)
        break
      case TEXT:
        node.textContent = currentPatch.content
        break
      default:
        throw new Error('Unknow patch type ' + currentPatch.type)
    }
  })
}

/**
 * 结语
 * Virtual DOM算法主要的实现就是上面三个函数 element diff patch.然后就可以实际进行使用
 */

// 1. 构建虚拟DOM
var tree = el('div', {'id': 'container'}, [
  el('h1', {style: 'color: blue'}, ['simple virtual dom']),
  el('p', ['Hello, virtual-dom']),
  el('ul', [el('li')])
])

// 2. 通过虚拟DOM构建真正的DOM
var root = tree.render()
document.body.appendChild(root)

// 3. 生成新的虚拟DOM
var newTree = el('div', {'id': 'container'}, [
  el('h1', {style: 'color: red'}, ['simple virtual dom']),
  el('p', ['Hello, virtual-dom']),
  el('ul', [el('li'), el('li')])
])

// 4. 比较两棵虚拟DOM树的不同
var patches = diff(tree, newTree)

// 5. 在真正的DOM元素上应用变更
patch(root, patches)


