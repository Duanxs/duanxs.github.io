const obj = {
  name: 'Alice',
  address: {
    city: 'New York',
    street: '123 Main St',
  },
}
const proxy = new Proxy(obj, {
  get(target, prop, receiver) {
    // if (prop !== 'address') {
    //   return target[prop]
    // }
    console.log(`监听到对象引用变化: ${target[prop]}`)
    return target[prop]

    // const address = target[prop]
    // const proxyAddress = new Proxy(address, {
    //   get(target, prop, receiver) {
    //     console.log(`监听到对象引用变化: ${prop}`)
    //     return target[prop]
    //   },
    // })

    // return proxyAddress
  },
})

proxy.address.city
proxy.address.street
proxy.address.building = '123A'

const arr = [1, 2]

arr.forEach((item) => {
  arr.length = 10
  console.log(item)
})

const o = {
  a: 1,
  b: 2,
  c: 3,
}

function fn() {
  this.d = 4
}
fn.prototype = o

const o1 = new fn()
console.log(`o1:`, o1)

for (const key in o1) {
  console.log(key)
}
