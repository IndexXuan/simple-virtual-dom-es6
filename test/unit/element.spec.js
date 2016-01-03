/**
  File   : element.spec.js
  Date   : 2016年01月01日 星期五 15时42分01秒
*/

import Element from '../../src/lib/element'

let el = function(...args) {
  return new Element(...args)
}

describe('Test Element Class', () => {

  it('Element\'s count is the sum of its children\'s count', () => {
    let root = el('ul', {name: 'jerry'}, [
      el('li', null, [el('span')]),
      el('li', null, [el('span')]),
      el('li', null, [el('span')]),
      el('li', null, [el('span')])
    ])

    expect( root.count ).toBe(8)
    expect( root.props ).toEqual({name: 'jerry'})
    expect( root.tagName ).toEqual('ul')
    expect( root.children[0].tagName ).toEqual('li')
    expect( root.children[0].count ).toEqual(1)
  })

  it('Element should have a key property if it\'s passed', () => {
    let root = el('li', {key: 'uuid'})
    expect( root.key ).toEqual('uuid')
  })

  it('Passing dynamic parameters: props is optional', () => {
    let root = el('ul', [
      el('li', null, [el('span')]),
      el('li', null, [el('span')]),
      el('li', null, [el('span')]),
      el('li', null, [el('span')])
    ])

    expect( root.count ).toEqual(8)
    expect( root.tagName ).toEqual('ul')
    expect( root.children[0].tagName ).toEqual('li')
    expect( root.children[0].count ).toEqual(1)
  })

  it('Calling render method', () => {

    let props = {id: 'root', dataStyle: 'color: red'}
    let root = el('ul', props, [
      el('li'),
      el('li', [el('span')]),
      'Fuck'
    ])

    // render the root and append it to dom
    let rootElement = root.render()
    document.body.appendChild(rootElement)

    let renderedHTML = document.getElementById('root')
    expect( renderedHTML.getAttribute('dataStyle') ).toEqual('color: red')
    expect( renderedHTML.childNodes.length ).toBe(3)
  })
  
  it('Using count to get DFS index is right', () => {
    let root = el('div', [
      el('div', [el('div'), el('p'), el('p')]),
      el('p', [el('span'), el('li'), el('li')]),
      el('ul', [el('li'), el('li')])
    ])

    let index = 0
    function dfs(root) {
      check(index, root)
      root.children.forEach( (child) => {
        index++
        dfs(child)
      })
    }

    function check(i, node) {
      switch (i) {
        case 0: return expect( node ).toEqual(root)
        case 1: return expect( node ).toEqual(root.children[0])
        case 2: return expect( node ).toEqual(root.children[0].children[0])
        case 3: return expect( node ).toEqual(root.children[0].children[1])
        case 4: return expect( node ).toEqual(root.children[0].children[2])
        case 5: return expect (node ).toEqual(root.children[1])
        case 6: return expect( node ).toEqual(root.children[1].children[0])
        case 7: return expect( node ).toEqual(root.children[1].children[1])
        case 8: return expect( node ).toEqual(root.children[1].children[2])
        case 9: return expect( node ).toEqual(root.children[2])
        case 10: return expect( node ).toEqual(root.children[2].children[0])
        case 11: return expect( node ).toEqual(root.children[2].children[1])
        case 13: return expect( node ).toEqual(root.children[2].children[2])
      }
    }

    dfs(root, index)
  })

  it('Setting value of input and textarea', () => {
    let input = el('div', {}, [
      el('input', {value: 'string value'}, null),
      el('textarea', {value: 'string value2'}, null)
    ])
    let dom = input.render()

    expect( dom.childNodes[0].value ).toEqual('string value')
    expect( dom.childNodes[1].value ).toEqual('string value2')
  })

  it('Setting value of normal nodes', () => {
    let input = el('div', {}, [
      el('div', {value: 'string value'}, null)
    ])
    let dom = input.render()
    expect( dom.children[0].value ).toBe(undefined)
    expect( dom.children[0].getAttribute('value') ).toEqual('string value')
  })

})

