var diff = require("./diff.js")

var oldList = [
  {
    key: "a",
  },
  {
    key: "b",
  },
  {
    key: "d"
  }
]

var newList = [
  {
    key: "e"
  },
  {
    key: "b"
  },
  {
    key: "m"
  },
  {
    key: "d"
  }
]

var result = diff(oldList, newList, "key")
console.log(result)

result.actions.forEach(function (action) {
  console.log(action)
})