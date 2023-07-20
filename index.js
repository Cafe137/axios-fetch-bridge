const axios = require('axios')
const cafe_utility = require('cafe-utility')
const node_fetch = require('node-fetch')

const fetchAdapter = async config => {
    const request = createRequest(config)
    const promiseChain = [getResponse(request, config)]
    if (config.timeout && config.timeout > 0) {
        promiseChain.push(
            new Promise(resolve => {
                setTimeout(() => {
                    resolve(new axios.AxiosError(`Timeout of ${config.timeout} ms exceeded`, 'ERR_TIMEOUT'))
                }, config.timeout)
            })
        )
    }
    const data = await Promise.race(promiseChain)
    return new Promise((resolve, reject) => {
        if (data instanceof Error) {
            reject(data)
        } else {
            resolve(data)
        }
    })
}
exports.fetchAdapter = fetchAdapter
function createRequest(config) {
    const options = {
        headers: config.headers,
        method: (config.method || 'GET').toUpperCase(),
        body: config.data,
        compress: false
    }
    const url = cafe_utility.Strings.buildUrl(config.baseURL, config.url, config.params)
    return new node_fetch.Request(url, options)
}
async function getResponse(request, config) {
    let fetchResponse
    try {
        fetchResponse = await (0, node_fetch.default)(request)
    } catch (e) {
        throw new axios.AxiosError('Network Error', 'ERR_NETWORK')
    }
    const response = {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: fetchResponse.headers,
        config,
        request,
        data: await getData(fetchResponse, config)
    }
    return response
}
async function getData(fetchResponse, config) {
    switch (config.responseType) {
        case 'arraybuffer':
            return fetchResponse.arrayBuffer()
        case 'blob':
            return fetchResponse.blob()
        case 'json':
            return fetchResponse.json()
        default:
            return fetchResponse.text()
    }
}
