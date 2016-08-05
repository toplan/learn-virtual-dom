var _ = module.exports

_.isObject = function (target) {
  return target && Object.prototype.toString.call(target) === "[object Object]"
}

_.isArray = Array.isArray || function (target) {
  return target && Object.prototype.toString.call(target) === "[object Array]"
}
