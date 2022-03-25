import { instanceDataCenter, instanceSearch } from '@/plugins/request'
export function get (params) {
  // console.log(params, 'params')
  return instanceDataCenter.get('data/v1/get', {
    method: 'GET',
    params
  })
}
export function getCode (params) {
  return instanceSearch.get('get', {
    method: 'GET',
    params
  })
}
