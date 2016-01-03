/**
  File   : diff.spec.js
  Date   : 2016年01月03日 星期日 08时32分09秒
*/

import Element from '../../src/lib/element'
import diff from '../../src/lib/diff'
import patch from '../../src/lib/patch'

function el(...args) {
  return new Element(...args)
}

describe('Test diff algorithm', () => {
  it('Node replacing', () => {
    let oldRoot = el('div', [el('p'), el('div'), el('section')])
    let newRoot = el('div', [el('p'), el('span')], el('section'))

    let patches = diff(oldRoot, newRoot)
    expect( patches[2][0].type ).toEqual(patch.REPLACE)
  })

  it('Node propeties change', () => {
    let oldRoot = el('div', [
      el('p', [el('span', { style: 'blue' })]),
      el('p', [el('span', { style: 'red' })]),
      el('p', [el('span', { style: 'yellow' })])
    ])

    let newRoot = el('div', [
      el('p', [el('span', { style: 'blue', index: '0' })]),
      el('p', [el('span', { class: 'fuck' })]),
      el('p', [el('span', { style: 'yellow green' })])
    ])

    let patches = diff(oldRoot, newRoot)
    expect( patches[2][0].type ).toEqual(patch.PROPS)
    expect( patches[2][0].props).toEqual( { index: '0' })
    
    expect( patches[4][0].type ).toEqual(patch.PROPS)
    expect( patches[4][0].props ).toEqual({ style: void 0, class: 'fuck' })

    expect( patches[6][0].type ).toEqual(patch.PROPS)
    expect( patches[6][0].props ).toEqual({ style: 'yellow green' }) 
  })

  it('Node removing', () => {
    let oldRoot = el('div', [
      el('p', [el('span', { style: 'blue' })]),
      el('p', [el('span', { style: 'red' }), el('p'), el('div')]),
      el('p', [el('span', { style: 'yellow' })])
    ])

    let newRoot = el('div', [
      el('p', [el('span', { style: 'blue' })]),
      el('p', [el('span', { style: 'red' })]),
      el('p', [el('span', { style: 'yellow' })])
    ])

    let diffs = diff(oldRoot, newRoot)
    expect( diffs[3][0].type ).toEqual(patch.REORDER)
    expect( diffs[3][0].moves).toEqual([
      { type: 0, index: 1 },
      { type: 0, index: 1}
    ])
  })

  it('Reordering with keyed items', () => {
    let oldRoot = el('ul', {id: 'list'}, [
      el('li', {key: 'a'}),
      el('li', {key: 'b'}),
      el('li', {key: 'c', style: 'shit'}),
      el('li', {key: 'd'}),
      el('li', {key: 'e'})
    ])

    let newRoot = el('ul', {id: 'lsit'}, [
      el('li', {key: 'a'}),
      el('li', {key: 'c'}),
      el('li', {key: 'e'}),
      el('li', {key: 'd'}),
      el('li', {key: 'b', name: 'Jerry'})
    ])

    let diffs = diff(oldRoot, newRoot)
    expect( diffs[0].length ).toBe(2)
    expect( diffs[2][0].type ).toEqual(patch.PROPS)
    expect( diffs[3][0].type ).toEqual(patch.PROPS)

    expect( diffs[2][0].props ).toEqual({name: 'Jerry'})
    expect( diffs[3][0].props ).toEqual({style: void 0})

    expect( diffs[0][0].type ).toEqual(patch.PROPS)
    expect( diffs[0][1].type ).toEqual(patch.REORDER)
    expect( diffs[0][1].moves.length ).toEqual(4)
  })

  it('Text replacing', () => {
    let oldRoot = el('div', [
      el('p', ['Jerry', 'is', 'my', 'love']),
      el('p', ['Jerry', 'is', 'my', 'love'])
    ])

    let newRoot = el('div', [
      el('p', ['Jerry', 'is', 'my', 'love']),
      el('p', ['Luzy', 'is', 'my', 'hate'])
    ])

    let diffs = diff(oldRoot, newRoot)
    expect( diffs[7][0].type ).toEqual(patch.TEXT)
    expect( diffs[10][0].type ).toEqual(patch.TEXT)
  })

  it('Diff complicated dom', () => {
    let color = 'blue'
    let count = 0
    let root1 = el('div', {'id': 'container'}, [
      el('h1', {style: `color: ${color}`}, ['simple virtual dom']),
      el('p', [`the count is :${count}`]),
      el('ul', el('li'))
    ])

    let root2 = el('div', {'id': 'container'}, [
      el('h1', {style: `color: ${color}`}),
      el('p', [`the count is :${count}`]),
      el('ul', [el('li'), el('li')])
    ])

    let patches = diff(root1, root2)
    expect( typeof patches[5] ).toBe('object')
  })

})

