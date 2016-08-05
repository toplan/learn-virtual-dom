/*
 | 找出连个对象列表的最小编辑路径(即最小编辑距离问题)。
 | 使用对象的一个指定属性(如: `key`)来区分两个对象是否相同，
 | 如果一个对象没有该指定属性，则判定该对象与任何对象都不相同。
 |
 | @param array oldList
 | @param array newList
 | @param string key 对象的唯一标识属性
 |
 | newList和oldList的结构示例: 
 | [{key: xx, data: ...}, {key: xxx, data: ...}, ...]
 |
 */
var _ = require('../util.js') 

var DELETION = 0
var INSERTION = 1
var SUBSTITUTION = 2

var distance = []
var actions = []
var logs = []

function Action (index, type, item, distance) {
  if (!_.isObject(this)) {
    return new Action(index, type, item)
  }
  this.index = index
  this.type = type
  this.item = item
  this._distance = distance 
}

function deletion (oldPos, newPos) {
  return distance[oldPos - 1][newPos] + 1
}

function insertion (oldPos, newPos) {
  return distance[oldPos][newPos - 1] + 1
}

function substitution(oldPos, newPos, cost) {
  if (typeof cost === "function") {
    cost = cost.call(null)
  }
  if (cost !== 0 && cost !== 1) {
    throw new Error("Cost param must be 0 or 1.")
  }
  return distance[oldPos - 1][newPos - 1] + cost
}

function initDistanceData (oldList, newList) {
  var oldLen = oldList.length
  var newLen = newList.length

  for (var i = 0; i <= oldLen; i++) {
    distance[i] = [i]
  }
  for (var i = 0; i <= newLen; i++) {
    distance[0][i] = i
  }
}

function computeDistance (oldList, newList, key) {
  var oldLen = oldList.length
  var newLen = newList.length
  var preMinDistance = 0

  for (var i = 1; i <= oldLen; i++) {
    for (var j = 1; j <= newLen; j++) {
      var distanceOfDeletion = deletion(i, j)
      var distanceOfInsertion = insertion(i, j)
      var distanceOfSubstitution = substitution(i, j, function () {
        var oldItem = oldList[i - 1]
        var newItem = newList[j - 1]
        if (!key || !(key in oldItem) || !(key in newItem)) {
          return 1
        }
        if (oldItem[key] === newItem[key]) {
          return 0
        }
        return 1
      })

      var min = Math.min(distanceOfDeletion, distanceOfInsertion, distanceOfSubstitution)
      distance[i][j] = min
      updateActions(i, j, min, preMinDistance, function (push) {
        preMinDistance = min
        if (push) {
          switch (min) {
            case distanceOfDeletion: actions.push(new Action(i - 1, DELETION, null, min)); break;
            case distanceOfInsertion: actions.push(new Action(i - 1, INSERTION, newList[j - 1], min)); break;
            case distanceOfSubstitution: actions.push(new Action(i - 1, SUBSTITUTION, newList[j - 1], min)); break;
            default: break;
          }
        }
      })
    }
  }

  return getMinDistance()
}

function updateActions (oldPos, newPos, minDistance, preMinDistance, cb) {
  if (minDistance && (minDistance - preMinDistance === 1 || minDistance == preMinDistance)) {
    actions.forEach(function (action, index) {
      if (action._distance === minDistance) {
        actions.splice(index, 1)
      }
    })
    return cb(true)
  }
  cb(false)
}

function getMinDistance() {
  var array = distance[distance.length - 1]
  return array[array.length - 1]
}

function diff(oldList, newList, key) {
  if (!_.isArray(oldList)) {
    oldList = [oldList]
  }
  if (!_.isArray(newList)) {
    newList = [newList]
  }
  oldList = oldList.filter(_.isObject)
  newList = newList.filter(_.isObject)

  initDistanceData(oldList, newList)

  var minDistance = computeDistance(oldList, newList, key)

  actions = actions.filter(function (action) {
    var isPass = action._distance <= minDistance
    delete action._distance
    return isPass
  })

  return {
    minDistance: minDistance,
    distance: distance,
    actions: actions
  }
}

module.exports = diff
