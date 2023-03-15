import axios from "axios"
import _ from "lodash"
import { baseURL, loginURL } from "./paths.js"

const instance = axios.create({
  baseURL,
  timeout: 3000,
  headers: {
    Origin: baseURL,
    Referer: `${baseURL}/problemset/all/`,
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
    "x-timezone": "Asia/Shanghai",
    "sec-fetch-site": "same-origin",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
  },
  maxRedirects: 0,
})

let cookie = []
let csrfToken = ""

// 拦截请求，请求头中添加 cookie 和 x-csrftoken
instance.interceptors.request.use(
  (config) => ({
    ...config,
    headers: {
      ...config.headers,
      Cookie: _.join(cookie, "; "),
      "x-csrftoken": csrfToken,
    },
  }),
  (error) => Promise.reject(error),
)

// 禁止登录后重定向，拦截登录响应，获取 cookie、csrftoken
instance.interceptors.response.use(
  (response) => Promise.resolve(response.data.data),
  (res) => {
    const { config, response } = res
    if (config.url === loginURL && response?.status === 302) {
      cookie = _.map(response.headers["set-cookie"], (val) =>
        _.split(val, ";").shift(),
      )

      csrfToken = _.replace(
        _.find(cookie, (v) => _.startsWith(v, "csrftoken=")),
        "csrftoken=",
        "",
      )
      return Promise.resolve(response)
    }
    return Promise.reject(res)
  },
)

const request = (config) => instance(config)

request.get = (url, config = {}) =>
  request({
    url,
    ...config,
    method: "get",
  })

request.post = (url, data, config = {}) =>
  request({
    url,
    data,
    ...config,
    method: "post",
  })

request.delete = (url, config = {}) =>
  request({
    url,
    ...config,
    method: "post",
  })

request.put = (url, data, config = {}) =>
  request({
    url,
    data,
    ...config,
    method: "put",
  })

export default request
