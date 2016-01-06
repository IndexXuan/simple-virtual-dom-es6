/**
  File   : patch.spec.js
  Date   : 2016年01月03日 星期日 10时53分09秒
*/

import Element from '../../src/lib/Element'
import diff from '../../src/lib/diff'
import patch from '../../src/lib/patch'

function el(...args) {
  return new Element(...args)
}

describe('Test patch function', () => {

  it('Attribute adding', () => {
    let root = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('div', ['I love you']),
      el('section', ['I love you'])
    ])

    let root2 = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('div', {name: 'Jerry'}, ['I love you']),
      el('section', ['I love you'])
    ])

    let dom = root.render()
    let patches = diff(root, root2)

    spyOn(dom.childNodes[1], 'setAttribute')
    patch(dom, patches)

    // expect( dom.childNodes[1].getAttribute('name') ).toEqual('Jerry')
    expect( dom.childNodes[1].setAttribute ).toHaveBeenCalledWith('name', 'Jerry')
    expect( dom.childNodes[1].setAttribute.calls.count() ).toBe(1)
  })

  it('Attributes removing', () => {
    let root = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('div', ['I love you']),
      el('section', ['I love you'])
    ])

    let root2 = el('div', [
      el('p', ['I love you']),
      el('div', {name: 'Jerry'}, ['I love you']),
      el('section', ['I love you'])
    ])

    let dom = root.render()
    let patches = diff(root, root2)
    spyOn(dom, 'removeAttribute')

    patch(dom, patches)

    // expect( dom.childNodes[1].getAttribute('id') ).toEqual(null)
    expect( dom.removeAttribute.calls.count() ).toBe(1)
  })

  it('Text replacing', () => {
    let root = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('div', ['I love you']),
      el('section')
    ])

    let root2 = el('div', [
      el('p', ['I love you']),
      el('div', {name: 'Jerry'}, ['I love you']),
      el('section', ['I love you'])
    ])

    let dom = root.render()
    spyOn(dom.childNodes[1], 'setAttribute')
    let patches = diff(root, root2)
    patch(dom, patches)
    expect( dom.childNodes[1].setAttribute).toHaveBeenCalled()
  })

  it('Node replacing', () => {
    let root = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('div', ['I love you']),
      el('section', ['I love you'])
    ])

    let root2 = el('div', {id: 'content'}, [
      el('p', ['I love you']),
      el('p', {name: 'Jerry'}, ['I love you']),
      el('section', ['I love you, too'])
    ])

    let dom = root.render()
    var patches = diff(root, root2)
    spyOn(dom, 'replaceChild')
    patch(dom, patches)
    // expect( dom.childNodes[1].tagName ).toBe('P')
    expect( dom.replaceChild.calls.count() ).toBe(1)
  })

  it('Nodes reordering', () => {
    let root = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'c'}, ['Item 3']),
      el('li', {key: 'd'}, ['Item 4']),
      el('li', {key: 'e'}, ['Item 5'])
    ])

    let root2 = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'd'}, ['Item 4']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'e'}, ['Item 5']),
      el('li', {key: 'c'}, ['Item 3'])
    ])

    let dom = root.render()
    spyOn(dom, 'insertBefore')
    spyOn(dom, 'removeChild')
    let patches = diff(root, root2)
    patch(dom, patches)
    // expect( dom.insertBefore).toHaveBeenCalled()
    expect(dom.insertBefore.calls.count() ).toBe(2)
    expect( dom.removeChild ).not.toHaveBeenCalled()
  })

  it('Root replacing', () => {
    let root = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item1']),
      el('li', {key: 'b'}, ['Item2']),
      el('li', {key: 'c'}, ['Item3']),
      el('li', {key: 'd'}, ['Item4']),
      el('li', {key: 'e'}, ['Item5'])
    ])

    let root2 = el('div', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item1']),
      el('li', {key: 'd'}, ['Item4']),
      el('li', {key: 'b'}, ['Item2']),
      el('li', {key: 'e'}, ['Item5']),
      el('li', {key: 'c'}, ['Item3'])
    ])

    let dom = root.render()
    document.body.appendChild(dom)
    let patches = diff(root, root2)
    patch(dom, patches)
    dom = document.getElementById('content')
    expect( dom.innerHTML ).toEqual(root2.render().innerHTML)
  })

  it('Using patches do not exist, should throw error', () => {
    let root = el('div', ['good'])
    let dom = root.render()
    try {
      patch(dom, {
        1: [{type: 6}, {}]
      })
    } catch (e) {
      expect( e.toString() ).toEqual('Error: Unknown patch type 6')
    }
  })

  it('When child node is not the same, do not remove it', () => {
    let root = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'c'}, ['Item 3']),
      el('li', {key: 'd'}, ['Item 4']),
      el('li', {key: 'e'}, ['Item 5'])
    ])

    let root2 = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'd'}, ['Item 4']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'c'}, ['Item 3']),
      el('li', {key: 'e'}, ['Item 5'])
    ])

    let dom = root.render()
    spyOn(dom, 'removeChild')
    dom.removeChild(dom.childNodes[3])
    let patches = diff(root, root2)
    patch(dom, patches)
    // expect( dom.removeChild ).toHaveBeenCalled()
    expect( dom.removeChild.calls.count() ).toBe(1)
  })

  it('When child nodes are the same, remove it', () => {
    let root = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'c'}, ['Item 3']),
      el('li', {key: 'd'}, ['Item 4']),
      el('li', {key: 'e'}, ['Item 5'])
    ])

    let root2 = el('ul', {id: 'content'}, [
      el('li', {key: 'a'}, ['Item 1']),
      el('li', {key: 'b'}, ['Item 2']),
      el('li', {key: 'c'}, ['Item 3']),
      el('li', {key: 'e'}, ['Item 5'])
    ])

    let dom = root.render()
    spyOn(dom, 'removeChild')
    let patches = diff(root, root2)
    patch(dom, patches)
    // expect( dom.removeChild ).toHaveBeenCalled()
    expect( dom.removeChild.calls.count() ).toBe(1)
  })

  it('Patching input & textarea', () => {
    let input = el('div', {}, [
      el('input', {value: 'old string'}, null),
      el('textarea', {value: 'old string'}, null)
    ])

    let dom = input.render()
    let input2 = el('div', {}, [
      el('input', {value: 'new string'}, null),
      el('textarea', {value: 'new string'}, null)
    ])
    let patches = diff(input, input2)
    patch(dom, patches)
    expect( dom.childNodes[0].value ).toEqual('new string')
    expect( dom.childNodes[1].value ).toEqual('new string')
  })

  xit('Test nodeValue for IE', () => {
    let root = el('div', {}, [
      el('input', {value: 'old string'}, null),
      el('textarea', {value: 'old string'}, null),
      'ok this is a string'
    ])
    let dom = root.render()
    let text = dom.childNodes[2]
    expect( text.textContent ).toEqual('ok this is a string')
    delete text.textContent

    let root2 = el('div', {}, [
      el('input', {value: 'old string'}, null),
      el('textarea', {value: 'old string'}, null),
      'ok this is a string2'
    ])

    let patches = diff(root, root2)
    patch(dom, patches)
    expect( text.nodeValue ).toEqual('ok this is a string2')
  })

})

