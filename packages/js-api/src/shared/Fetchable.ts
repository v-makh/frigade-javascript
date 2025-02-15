import { generateGuestId, getEmptyResponse, getHeaders, gracefulFetch } from './utils'
import { FrigadeConfig } from '../types'
import { frigadeGlobalState, FrigadeGlobalState, getGlobalStateKey } from './state'

export class Fetchable {
  public config: FrigadeConfig = {
    apiKey: '',
    apiUrl: 'https://api.frigade.com/v1/public',
    userId: generateGuestId(),
    __instanceId: Math.random().toString(36).substring(7),
  }

  constructor(config: FrigadeConfig) {
    const filteredConfig = Object.fromEntries(Object.entries(config).filter(([_, v]) => v != null))

    this.config = {
      ...this.config,
      ...filteredConfig,
    }
  }

  public async fetch(path: string, options?: Record<any, any>) {
    if (this.config.__readOnly) {
      return getEmptyResponse()
    }

    return gracefulFetch(`${this.config.apiUrl}${path}`, {
      ...(options ?? {}),
      ...getHeaders(this.config.apiKey),
    })
  }

  protected getGlobalState(): FrigadeGlobalState {
    const globalStateKey = getGlobalStateKey(this.config)
    if (!frigadeGlobalState[globalStateKey]) {
      throw new Error('Frigade not initialized')
    }
    return frigadeGlobalState[globalStateKey]
  }
}
