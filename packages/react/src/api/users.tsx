import React, { useCallback, useContext, useEffect } from 'react'
import { FrigadeContext } from '../FrigadeProvider'
import { useCheckHasInitiatedAPI, useConfig, useGracefulFetch } from './common'
import { useUserFlowStates } from './user-flow-states'
import { EntityProperties } from '../FrigadeForm/types'

interface AddPropertyToUserDTO {
  readonly foreignId: string
  readonly properties?: { [key: string]: string | boolean | number | null }
  readonly events?: UserEvent[]
  readonly linkGuestId?: string
}

interface UserEvent {
  readonly event: string
  readonly properties?: { [key: string]: string | boolean | number | null }
}

export const GUEST_PREFIX = 'guest_'

export function useUser(): {
  readonly userId: string | null
  readonly setUserId: React.Dispatch<React.SetStateAction<string | null>>

  /**
   * Sets the user id and properties for the current user.
   * @param userId The user id of the user that is currently logged in.
   * @param properties The properties of the user that is currently logged in.
   * @param linkGuestSession If true, any data/state collected during guest session will be linked to the user.
   */
  readonly setUserIdWithProperties: (
    userId: string,
    properties?: EntityProperties,
    linkGuestSession?: boolean
  ) => Promise<void>
  readonly addPropertiesToUser: (properties: EntityProperties) => Promise<void>
  readonly trackEventForUser: (event: string, properties?: EntityProperties) => Promise<void>
} {
  const {
    userId: userIdInternal,
    organizationId,
    setUserId,
    setUserProperties,
    shouldGracefullyDegrade,
  } = useContext(FrigadeContext)
  const { config, apiUrl } = useConfig()
  const { mutateUserFlowState } = useUserFlowStates()
  const gracefullyFetch = useGracefulFetch()
  const { verifySDKInitiated } = useCheckHasInitiatedAPI()

  function getUserIdKey(id?: string) {
    return `frigade-user-registered-${id}`
  }

  // Use local storage to mark if user has already been registered in frigade
  useEffect(() => {
    // Check if user is not a guest
    if (userIdInternal && !organizationId) {
      // Check if userid begins with the guest prefix
      if (userIdInternal.startsWith(GUEST_PREFIX)) {
        return
      }
      const userRegisteredKey = getUserIdKey(userIdInternal)
      // Check if user has already been registered in frigade
      if (!localStorage.getItem(userRegisteredKey)) {
        // Register user in frigade
        gracefullyFetch(`${apiUrl}users`, {
          ...config,
          method: 'POST',
          body: JSON.stringify({ foreignId: userIdInternal }),
        })
        // Mark user as registered in frigade
        localStorage.setItem(userRegisteredKey, 'true')
      }
    }
  }, [userIdInternal, shouldGracefullyDegrade, organizationId])

  const addPropertiesToUser = useCallback(
    async (properties: EntityProperties) => {
      if (!verifySDKInitiated()) {
        return
      }
      const data: AddPropertyToUserDTO = {
        foreignId: userIdInternal,
        properties,
      }
      await gracefullyFetch(`${apiUrl}users`, {
        ...config,
        method: 'POST',
        body: JSON.stringify(data),
      })
      setUserProperties((userProperties) => ({ ...userProperties, ...properties }))
      mutateUserFlowState()
    },
    [userIdInternal, config, shouldGracefullyDegrade, mutateUserFlowState]
  )

  const trackEventForUser = useCallback(
    async (event: string, properties?: EntityProperties) => {
      if (!verifySDKInitiated()) {
        return
      }
      const eventData: UserEvent = {
        event,
        properties,
      }
      const data: AddPropertyToUserDTO = {
        foreignId: userIdInternal,
        events: [eventData],
      }
      await gracefullyFetch(`${apiUrl}users`, {
        ...config,
        method: 'POST',
        body: JSON.stringify(data),
      })
      mutateUserFlowState()
    },
    [userIdInternal, config, mutateUserFlowState]
  )

  const setUserIdWithProperties = useCallback(
    async (userId: string, properties?: EntityProperties, linkGuestSession?: boolean) => {
      if (!verifySDKInitiated()) {
        return
      }
      const existingId = `${userIdInternal}`
      const shouldLinkGuestSession = linkGuestSession && existingId.startsWith(GUEST_PREFIX)
      console.log('shouldLinkGuestSession', shouldLinkGuestSession, existingId)
      if (properties) {
        const userRegisteredKey = getUserIdKey(userId)
        localStorage.setItem(userRegisteredKey, 'true')
        setUserId(userId)
        const data: AddPropertyToUserDTO = {
          foreignId: userId,
          properties,
        }
        await gracefullyFetch(`${apiUrl}users`, {
          ...config,
          method: 'POST',
          body: JSON.stringify(data),
        })
        setUserProperties((userProperties) => ({ ...userProperties, ...properties }))
        if (!shouldLinkGuestSession) {
          mutateUserFlowState()
        }
      } else {
        setUserId(userId)
      }
      if (shouldLinkGuestSession) {
        const data: AddPropertyToUserDTO = {
          foreignId: userId,
          linkGuestId: existingId,
        }
        await gracefullyFetch(`${apiUrl}users`, {
          ...config,
          method: 'POST',
          body: JSON.stringify(data),
        })
        mutateUserFlowState()
      }
    },
    [config, shouldGracefullyDegrade, mutateUserFlowState]
  )

  return {
    userId: userIdInternal,
    setUserId,
    setUserIdWithProperties,
    addPropertiesToUser,
    trackEventForUser,
  }
}
