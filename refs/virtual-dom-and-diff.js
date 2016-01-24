/*******************************************************
# File   : virtual-dom-and-diff.js
# Author : IndexXuan(https://github.com/IndexXuan)
# Mail   : indexxuan@gmail.com
# Date   : 2015年12月25日 星期五 11时57分06秒
 ******************************************************/

class VirtualDOM {
  constructor(type, props, children) {
    this.type = type
    this.props = props
    this.children = children
  }
}

const textDom = new VirtualDOM('span', {id: 'txt'}, 'i am some text')
const wrapDom = new VirtualDOM('div', {id: 'wrap'}, [textDom])

// 建立连接
/*
  <div v-id="0">
    <span v-id="0.0">i am some text</span>
  </div>
*/

let rootIdx = 0;
function mountElement(ele) {
  ele.rootId = rootIdx++;
  let tagOpen = `<${ele.type} v-id="${ele.rootId}">`
  let tagClose = `</${ele.type}>`
  let type
  
  // 遍历拼凑出虚拟DOM的innerHTML
  ele.children.forEach( (item, index) => {
    item.rootId = ele.rootId + '.' + index // 区分层级
    item.mountId = ele.rootId // 需要知道挂载在哪个对象上
    
    if ( Array.isArray(item.children) ) {
      tagOpen += mountElement(item);
    } else {
      type = item.type
      tagOpen += `<$type v-id="${item.rootId}">`
      tagOpen += item.children
      tagOpen += `</${type}>`
    }
  })
  tagOpen += tagClose
  
  return tagOpen
}

let virtualHTML = mountElement(wrapDom)
// document.querySelector('body').innerHTML = virtualHTML
  
// 现在我们已经建立了连接了，现在需要模拟一下视图更新，
// 于是我们新生成了一个虚拟DOM

let newTextDom = new VirtualDOM('span', {id: 'txt'}, 'look, i am change')
let newWrapDom = new VirtualDOM('div', {id: 'wrap'}, [newTextDom])

// find the diff
/*
<div v-id="0">
  <div v-id="0.0">
    <span v-id="0.0.0"></span>
    <span v-id="0.0.1"></span>
  </div>
  <div v-id="0.1">
    <span v-id="0.1.0"></span>
    <span v-id="0.1.1"></span>
  </div>
</div>
*/

// 比较差异
let diffQueue = [] // 记录差异的数组
let diffDepth = 0 // 每下去一层节点就+1
function updateDom(oldDom, newDom) {
  diffDepth++
  diff(oldDom, newDom, diffQueue)
  diffDepth--
  if (diffDepth === 0) {
    patch(oldDom, diffQueue)
    diffQueue = []
  }
}

// 扁平化
function flat(children) {
  let key;
  let result = new Map()
  children.forEach( (item, index) => {
    key = item.props.key ? item.props.key : index.toString(36)
    result[key] = item
  })
  
  return result
}

// diff
function diff(oldDom, newDom, diffQueue) {
  let oldFlat = flat(oldDom.children)
  let newFlat = generateNewMap(oldDom.children, newDom)
  
  let newIndex = 0 // 作为记录map遍历的顺序
  
  // 遍历新的虚拟DOM
  for (key in newFlat) {
    let oldItem = oldFlat[key]
    let newItem = generate[key]
    
    // 差异类型1 移动
    if (oldItem === newItem) { // 元素完全相同则认为是顺序移动了
      diffQueue.push({
        type:UPDATE_TYPES.MOVE,
        wrapId: oldItem.mountId, // 之前挂载对象id
        fromIndex: oldItem.rootId, // 本身位置id
        toIndex: nextIndex // 当前遍历的位置
      })
    } else {
      
      // 差异类型2 删除
      if (oldItem) { // 旧的和新的不符合，先删除
        diffQueue.push({
          type: UPDATE_TYPES.REMOVE,
          wrapId: oldItem.mountId,
          fromIndex: oldItem.rootId,
          toIndex: null
        })
      }
      
      // 差异类型3 插入
      diffQueue.push({
        type: UPDATE_TYPES.INSERT,
        wrapId: oldItem.mountId, 
        fromIndex: null,
        toIndex: nextIndex,
        ele: newItem // 方便后面渲染出innerHTML
      })
    }
    nextIndex++
  }
  
  // 遍历老的Map, 如果新的节点里不存在，也删除掉
  for (let key in oldFlat) {
    let oldItem = oldFlat[key]
    let newItem = newFlat[key]
    
    // 差异类型2 删除
    diffQueue.push({
      type: UPDATE_TYPES.REMOVE,
      wrapId: oldItem.mountId,
      fromIndex: oldItem.mountId,
      toIndex: null
    })
  }
}

/**
 * 这里注意我们生成新的Map是通过generateNewMap方法的，
 * generateNewMap实际上就是去递归调用diff,完成所有
 */
 
function generateNewMap(oldChildren, newDom, diffQueue) {
  newDom.children.forEach( (newItem, index) => {
    let oldItem = oldChildren[index]
    if ( shouldUpdate(oldItem, newItem) ) {
      diff(oldItem, newItem, diffQueue)
    }
  })
}

// 差异类型
const UPDATE_TYPES = {
  MOVE: 1, 
  REMOVE: 2,
  INSERT: 3,
  TEXT: 4
}

// 应用差异patch, 
// 我们已经得到了所有的差异diffQueue，是时候改动了
// 拿插入做例子，我们知道了挂载的对象以及插入的位置，
// 那么我们就可以用原生的insertBefore去执行
function insertAt(target, source, index) {
  let oldDom = target.children[index] // 获取目标对象下的index位置的子元素
  source.insertBefore(oldDom)
}

// 那么通过这些计算得到的source子元素和目标挂载元素target
// 中的位置index，我们就能够应用这些变化。

function patch(diffQueue) {
  let deleteArr = []
  let updateSepc = {}
  
  diffQueue.forEach( (update, index) => {
    if (update.type === UPDATE_TYPES.MOVE || update.type === UPDATE_TYPES.REMOVE) {
      let updateIndex = update.fromIndex
      let updateTarget = document.querySelector('[v-id=' + updateIndex + ']')
      let wrapIndex = update.wrapId
      
      // 保存下来，方便移动使用
      updateSpec[wrapIndex] = updateSpec[wrapIndex] || []
      updateSpec[wrapIndex][updateIndex] = udpateTarget
      
      // 记录删除
      removeArr.push(updateTarget)
    }
    
    // 删除节点
    updateTarget.forEach( (d) => {
      d.remove()
    })
    
    // 再次遍历
    diffQueue.forEach( (update) => {
      let target = document.querySelector(update.wrapId)
      
      switch (update.type) {
        case UPDATE_TYPES.INSERT:
          insertChildAt(target, source, update.toIndex)
          break
        case UPDATE_TYPES.MOVE:
          insertChildAt(target, updateSpec[update.wrapId][update.fromIndex], update.toIndex)
          break
      }
    })
  })
}

