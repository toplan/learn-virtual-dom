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

var map = []
var actions = []

function Action(index, type, item) {
  if (!_.isObject(this)) {
    return new Action(index, type, item)
  }
  this.index = index
  this.type = type
  this.item = item
}

function deletion(oldPos, newPos) {
  return map[oldPos - 1][newPos] + 1
}

function insertion(oldPos, newPos) {
  return map[oldPos][newPos - 1] + 1
}

function substitution(oldPos, newPos, cost) {
  if (typeof cost === "function") {
    cost = cost.call(null)
  }
  if (cost !== 0 && cost !== 1) {
    throw new Error("Cost param must be 0 or 1.")
  }
  return map[oldPos - 1][newPos - 1] + cost
}

function initDistanceData(oldList, newList) {
  var oldLen = oldList.length
  var newLen = newList.length

  map = []
  actions = []

  for (var i = 0; i <= oldLen; i++) {
    map[i] = [i]
  }
  for (var i = 0; i <= newLen; i++) {
    map[0][i] = i
  }
}

function computeDistance(oldList, newList, key) {
  var oldLen = oldList.length
  var newLen = newList.length

  for (var i = 1; i <= oldLen; i++) {
    for (var j = 1; j <= newLen; j++) {
      var distanceOfDeletion = deletion(i, j)
      var distanceOfInsertion = insertion(i, j)

      var costFn
      var distanceOfSubstitution = substitution(i, j, costFn = function () {
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
      map[i][j] = min

      //
      if (min && i === j) {
        switch (min) {
          case distanceOfDeletion:
            actions.push(new Action(i - 1, DELETION)); break;
          case distanceOfInsertion:
            actions.push(new Action(i - 1, INSERTION, newList[j - 1])); break;
          case distanceOfSubstitution:
            if (costFn()) {
              actions.push(new Action(i - 1, SUBSTITUTION, newList[j - 1]));
            }
            break;
          default: break;
        }
      }
      if (i === oldLen && j > i) {
        switch (min) {
          case distanceOfInsertion:
            actions.push(new Action(i - 1, INSERTION, newList[j - 1])); break;
          case distanceOfSubstitution:
            if (costFn()) {
              actions.push(new Action(i - 1, SUBSTITUTION, newList[j - 1]));
            }
            break;
          default:
            break;
        }
      }
      if (j === newLen && i > j) {
        switch (min) {
          case distanceOfDeletion:
            actions.push(new Action(i - 1, DELETION)); break;
          case distanceOfSubstitution:
            if (costFn()) {
              actions.push(new Action(i - 1, SUBSTITUTION, newList[j - 1]));
            }
            break;
          default: break;
        }
      }
    }
  }

  return getDistance(map)
}

function getDistance(map) {
  var array = map[map.length - 1]
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
  var distance = computeDistance(oldList, newList, key)

  return {
    distance: distance,
    map: map,
    actions: actions
  }
}

module.exports = diff
