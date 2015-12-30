function type(obj) {
  return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
}

function isArray(list) {
  return type(list) === 'Array'
}

function isString(list) {
  return type(list) === 'String'
}

function each(array, fn) {
  for (var i = 0, len = array.length; i < len; i++) {
    fn(array[i], i)
  }
}

function toArray(listLike) {
  if (!listLike) {
    return []
  }

  var list = []

  for (let i = 0, len = listLike.length; i < len; i++) {
    list.push(listLike[i])
  }

  return list
}

function setAttr(node, key, value) {
  switch (key) {
    case 'style':
      node.style.cssText = value
      break
    case 'value':
      var tagName = node.tagName || ''
      tagName = tagName.toLowerCase()
      if (
        tagName === 'input' || tagName === 'textarea'
      ) {
        node.value = value
      } else {
        // if it is not a input or textarea, use `setAttribute` to set
        node.setAttribute(key, value)
      }
      break
    default:
      node.setAttribute(key, value)
      break
  }
}

export {
  isArray,
  isString,
  each,
  toArray,
  setAttr
}

