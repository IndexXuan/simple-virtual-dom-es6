<h1 align="center">Reconciliation</h1> 

React的关键设计就是使得API看起来像是在每次更新时都re-render整个app。这使得编写
应用程序变得简单很多但是同时对易用性（性能）来说是个很大的挑战。这篇文章解释了
我们是怎样富有启发式的将这个问题复杂度从O(n^3)简化为O(n)。


##Motication  
生成两个不同树的最小操作集问题是个复杂且很有研究价值的问题，《state of the algorithms》
有一个复杂的解，时间复杂度O(n^3)。


这意味着展示1000个节点将需要进行1亿次比较。这对于我们的使用场景来说太过于庞大了。从数学
角度来看，如今的CPU每秒能执行3亿次指令，所以即使在性能最优的实现下，我们也不能在1秒内完成
这个diff。


既然最优算法不是易于处理，我们用一下两条假设来探索一个最优的O(n)算法：  
1. 一个类下的组件将会产生同样的树型结构并且不同类的组件实例将会产生不同的结构。    
2. 为元素提供一个唯一键来使得稳定的通过每次渲染是可行的。  

实际上，这些假设对于实际运用来说是极其有效的。  


##Pair-wise diff  
为了做一次树结构的diff，我们首先需要diff两个node(节点),共有三种不同的情形需要处理。


###Different Node Type  
如果节点类型不同，React将把它们看做不同节点，剔除第一个，构建并插入第二个。
```HTML
renderA: <div />  
renderB: <span />  
=> [removeNode <div />], [insertNode <span />]  
```  

了解这些高层知识对于明白为什么React的diff算法如此高效精准是非常重要的。这证明了分解树  
的大的节点以及将关注点放到可能相似的小节点部分是好的探索。  


很有可能一个<Header>元素与<Content>元素会生成非常相似的DOM结构，但是React不花时间来尝试
对两者进行比较而是直接一点点重新构建。  


作为一个推论，如果有一个<Header>元素在两次渲染都位于同一位置，你可以断定会生成相似的结构
而且值得探询它。  


##DOM Nodes


当对比两个DOM节点，我们先看两者的属性并且能够在线性时间下找到不同。  
```HTML
renderA: <div id="before" />  
renderB: <div id="after" />  
=> [replaceAttribute id "after"
```


把style看成是一个key-value对象而不是一个透明的字符串，这使得我们只更新变了的属性  


```HTML
renderA: <div style={{color: 'red'}} />  
renderB: <div style={{fontWeight: 'bold'}} />  
=> [removeStyle color], [addStyle font-weight 'bold']  
```

属性被更新后，我们对每个children节点进行递归调用  


##Custom Components
我们确定两个自定义节点是相同的。既然组件是带有状态的，我们不能仅仅使用新的组件并且
调用它一天。React拿到组件之前的所有属性并且调用component[Will/Did]ReceiveProps()  


先前的组件是可操作的，它的render()方法被调用并且diff算法利用新的结果和先前的结果重新计算。

##List-wise diff

###Problematic Case  
为了做children重排，React采用非常原始的方式，同时遍历children列表并且在有不同的时候生成变化。  


例如：如果你把一个元素添加到后面  
```HTML
renderA: <div><span>first</span></div>  
renderB: <div><span>first</span><span>second</span></div>  
=> [insertNode <span>second</span>]
```


把一个元素插入到开头是易出问题的，React将会确认两个节点都是span并且因此进入差异匹配模式  
```HTML
renderA: <div><span>first</span></div>  
renderB: <div><span>second</span><span>first</span></div>  
=> [replaceAttribute textContent 'second'], [insertNode <span>first</span>]  
```


有很多算法试图取找到最小操作集合来转化列表元素，[Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance "Levenshtein distance")
能使用单一元素的插入，删除和替换来找到最小操作集，时间复杂度在O(n^2)。即使我们用这个算法，也
不能处理节点移动到另一位置的情况并且算法也就不是那么明智了。


###keys
为了解决这看似无解的问题，最优的属性已经介绍过。你能提供每个child节点一个key值，以便用来做
匹配。如果你用了的key，React现就就能找到插入，删除和替换并且用Hash表来实现O(n)复杂度内的移动操作。


```HTML
renderA: <div><span key="first">first</span></div>  
renderB: <div><span key="second">second</span><span key="first">first</span></div>  
=> [insertNode <span>second</span>]  
```

实际上，找到key不是很难，大部分情况下，你所想要展示的元素已经有了一个唯一id。在不是这样的情况下，
你能在你的模型上新增一个id属性或者对内容散列来生成一个key。记住，兄弟节点下的key必须唯一，但全局
可以。


##Trade-offs
记住重排算法是一种实现细节很重要。React能够在每次操作都re-render整个app。最终结果都是一样的。
我们通常精炼的算法都是为了使大多数通常案例性能最优。  


在当前的实现下，我们可以确信子树被移出它的兄弟节点，但是你不能确定它被移到其他地方。算法将会
re-render这整个子树。  


因为我们依赖两个前提条件，如果条件不成立，性能将会受损。  
1. 算法不会取试图匹配不同类的组件子树。如果你觉得两个组件非常相似，你应该处理成同一类。
   实际上，我们不觉得这是个问题。  
2. keys应该稳定，可预测的并且独一无二的。不稳定的keys(像那些随机数生成的)将会引起节点不确定
的re-created，将会成为性能杀手，而且使child组件不稳定。




















