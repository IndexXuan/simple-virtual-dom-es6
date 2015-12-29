import * as _ from './util'

/**
 * Virtual-dom Element.
 * @param {String} tagName
 * @param {Object} props - Element's properties,
 *                       - using object to store key-value pair
 * @param {Array<Element|String>} - This element's children elements.
 *                                - Can be Element instance or just a piece plain text.
 */

export default class Element {
  constructor(tagName, props, children) {

    if (!(this instanceof Element)) {
      return new Element(tagName, props, children)
    }

    if (_.isArray(props)) {
      children = props
      props = {}
    }

    this.tagName = tagName
    this.props = props || {}
    this.children = children || []
    this.key = props
      ? props.key
      : void 0

    var count = 0

    _.each(this.children, (child, i) => {
      if (child instanceof Element) {
        count += child.count
      } else {
        children[i] = '' + child
      }
      count++
    })

    this.count = count
  }

  render() {
    var el = document.createElement(this.tagName)
    var props = this.props

    for (var propName in props) {
      var propValue = props[propName]
      _.setAttr(el, propName, propValue)
    }

    _.each(this.children, function(child) {
      var childEl = (child instanceof Element)
        ? child.render()
        : document.createTextNode(child)
      el.appendChild(childEl)
    })

    return el
  }

}

