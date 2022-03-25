import axios from 'axios'

const instanceDataCenter = axios.create()
instanceDataCenter.defaults.baseURL = 'https://datacenter-web.eastmoney.com/api/'

instanceDataCenter.interceptors.request.use(function (config) {
  // Do something before request is sent
  Object.assign(config.params, { callback: 'jQuery' })
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
instanceDataCenter.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  const reg = /{[\S\s]+}/
  const matches = response.data.substring(0, response.data.lastIndexOf(';')).match(reg)
  let res = null
  if (matches) {
    // matches[0]为整个字符串
    res = JSON.parse(matches[0])
    // matches[1]为匹配到的分组
  }
  return res
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error)
})

const instanceSearch = axios.create()
instanceSearch.defaults.baseURL = 'http://searchapi.eastmoney.com/api/suggest/'

instanceSearch.interceptors.request.use(function (config) {
  // Do something before request is sent
  Object.assign(config.params, { cb: 'jQuery1124042233391020875577_1648179458276', _: '1648179458420' })
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
instanceSearch.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  const reg = /{[\S\s]+}/
  const matches = response.data.substring(0, response.data.lastIndexOf(';')).match(reg)
  let res = null
  if (matches) {
    // matches[0]为整个字符串
    res = JSON.parse(matches[0])
    // matches[1]为匹配到的分组
  }
  return res
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error)
})

export { instanceDataCenter, instanceSearch }
