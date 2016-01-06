import * as _ from './util'

/**
 * Class - Virtual-dom Element.
 *
 * @param {String} tagName
 *
 * Element's properties, using object to store key-value pair
 * @param {Object} props  
 *
 * This element's children elements. Can be Element instance or just a plain text.
 * @param {Array<Element|String>}
 *
 */

export default class Element {

  constructor(tagName, props, children) {

    // make sure return an instance of Element-Class
    if (!(this instanceof Element)) {
      return new Element(tagName, props, children)
    }

    // reorder the arguments if no props 
    if (_.isArray(props)) {
      children = props
      props = {}
    }

    // set Class props
    this.tagName = tagName
    this.props = props || {}
    this.children = children || []
    this.key = props
      ? props.key
      : void 0

    // count prop
    let count = 0
    _.each(this.children, (child, i) => {
      if (child instanceof Element) {
        count += child.count
      } else {
        children[i] = '' + child
      }
      count++
    })
    this.count = count

  } // end of constructor

  render() {
    // create real-dom element
    let el = document.createElement(this.tagName)
    let props = this.props

    // set props for the real-dom element
    for (let propName in props) {
      let propValue = props[propName]
      _.setAttr(el, propName, propValue)
    }

    // render children
    _.each(this.children, function(child) {
      let childEl = (child instanceof Element)
        ? child.render()
        : document.createTextNode(child)
      el.appendChild(childEl)
    })

    return el
  }

}

