var diff = require("./diff.js")

if (true) {
  var old0 = [{key: "a"}, {key: "b"}, {key: "d"}]
  var new0 = [{key: "e"}, {key: "b"}, {key: "m"}, {key: "d"}]

  var result = diff(old0, new0, "key")
  console.log(result)

  result.actions.forEach(function (action) {
    console.log(action)
  })
}

if (true) {
  var old1 = [{key: "s"}, {key: "i"}, {key: "e"}, {key: "j"}]
  var new1 = [{key: "m"}, {key: "i"}, {key: "e"}, {key: "k"}, {key: "k"}]

  var result = diff(old1, new1, "key")
  console.log(result)

  result.actions.forEach(function (action) {
    console.log(action)
  })
}