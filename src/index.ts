import { AxiosAdapter, AxiosError, AxiosPromise, InternalAxiosRequestConfig } from 'axios'
import { Strings } from 'cafe-utility'
import fetch, { Headers, Request } from 'node-fetch'

export const fetchAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): AxiosPromise => {
    const request = createRequest(config)
    const promiseChain = [getResponse(request, config)]

    if (config.timeout && config.timeout > 0) {
        promiseChain.push(
            new Promise(resolve => {
                setTimeout(() => {
                    resolve(new AxiosError(`Timeout of ${config.timeout} ms exceeded`, 'ERR_TIMEOUT') as any)
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

function createRequest(config: InternalAxiosRequestConfig) {
    const options: Partial<Request> = {
        headers: config.headers as unknown as Headers,
        method: (config.method || 'GET').toUpperCase(),
        body: config.data,
        compress: false
    }
    const url = Strings.buildUrl(config.baseURL, config.url, config.params)

    return new Request(url, options)
}

async function getResponse(request: any, config: InternalAxiosRequestConfig) {
    let fetchResponse
    try {
        fetchResponse = await fetch(request)
    } catch (e) {
        throw new AxiosError('Network Error', 'ERR_NETWORK')
    }

    const response = {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: fetchResponse.headers as any,
        config,
        request,
        data: await getData(fetchResponse, config)
    }

    return response
}

async function getData(fetchResponse: any, config: InternalAxiosRequestConfig) {
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
