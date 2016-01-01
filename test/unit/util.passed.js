/**
  File   : util.spec.js
  Date   : 2016年01月01日 星期五 14时52分45秒
*/

import * as _ from '../../src/lib/util'

describe("Test utilities", () => {

  it('Test isArray function', () => {
    expect(_.isArray([])).toBe(true)
  })

  it('Checking object type', () => {
    expect(_.type({})).toBe('Object')
  })

  it('Test each function', () => {
    let list = [1, 2, 3, 4, 5]
    let count = 0
    _.each(list, () => count++)
    expect(count).toBe(5)
  })

  it('Test toArray function', () => {
    let list = [1, 2, 3, 4, 5]
    let list2 = _.toArray(list)
    expect(list2).toEqual([1, 2, 3, 4, 5])
    expect(_.toArray()).toEqual([])
  })

  it('Setting dom element\'s attribute: normal attribute', () => {
    let dom = document.createElement('div')
    _.setAttr(dom, 'key', 'name')
    _.setAttr(dom, 'input', 'name2')
    expect( dom.getAttribute('key') ).toBe('name')
    expect( dom.getAttribute('input')).toBe('name2')
  })

  it('Setting dom element\'s attribute: style', () => {
    let dom = document.createElement('div')
    _.setAttr(dom, 'style', 'color: red')
    expect( dom.style.cssText.toString().trim() ).toEqual('color: red;')
  })

  it('Setting dom element\'s attribute: value of input & textarea', () => {
    let dom = document.createElement('input')
    _.setAttr(dom, 'value', 'color')
    expect( dom.value ).toEqual('color')
    expect( dom.getAttribute('value') ).toBe(null)
  })

  it('Setting dom element\' s attribute: no errors without tagName', () => {
    let dom = document.createElement('input')
    dom.tagName = void 0
    _.setAttr(dom, 'value', 'color')
    expect( dom.value ).toEqual('color')
    expect( dom.getAttribute('value') ).toBe(null)
  })

})

