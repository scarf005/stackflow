import { Action, Location } from 'history'
import { DependencyList, useEffect, useRef } from 'react'
import qs from 'querystring'
import { useHistory, useLocation } from 'react-router-dom'

export function useHistoryPopEffect(
  callbacks: {
    forward: (location: Location<unknown>, action: Action) => void
    backward: (
      location: Location<unknown>,
      action: Action,
      depth: number
    ) => void
  },
  deps?: DependencyList | undefined
) {
  const history = useHistory()
  const location = useLocation()

  const locationKeyStack = useRef<string[]>([])

  useEffect(() => {
    if (locationKeyStack.current.length > 0 || !location.search) {
      return
    }

    const [, search] = location.search.split('?')
    const { _si } = qs.parse(search)

    if (!_si) {
      return
    }

    locationKeyStack.current = [location.pathname + location.search]
  }, [location.search])

  useEffect(() => {
    return history.listen((location, action) => {
      const locationKey = location.pathname + location.search

      switch (action) {
        case 'PUSH': {
          if (
            locationKeyStack.current[locationKeyStack.current.length - 1] !==
            locationKey
          ) {
            locationKeyStack.current.push(locationKey)
          }
          break
        }
        case 'REPLACE': {
          locationKeyStack.current[
            locationKeyStack.current.length - 1
          ] = locationKey
          break
        }
        case 'POP': {
          const pointer = locationKeyStack.current.findIndex(
            (key) => key === locationKey
          )
          if (pointer > -1) {
            const depth = locationKeyStack.current.length - pointer
            locationKeyStack.current = locationKeyStack.current.filter(
              (_, idx) => idx <= pointer
            )
            callbacks.backward?.(location, action, depth)
          } else {
            locationKeyStack.current.push(locationKey)
            callbacks.forward?.(location, action)
          }
        }
      }
    })
  }, deps)
}

export function useHistoryPushEffect(
  callback: (location: Location<unknown>, action: Action) => void,
  deps?: DependencyList | undefined
) {
  const history = useHistory()
  const location = useLocation()
  const locationKeyStack = useRef<string[]>([])

  useEffect(() => {
    locationKeyStack.current = [location.pathname + location.search]
  }, [])

  useEffect(() => {
    return history.listen((location, action) => {
      const locationKey = location.pathname + location.search

      switch (action) {
        case 'PUSH': {
          if (
            locationKeyStack.current[locationKeyStack.current.length - 1] !==
            locationKey
          ) {
            locationKeyStack.current.push(locationKey)
            callback(location, action)
          }
          break
        }
        case 'REPLACE': {
          locationKeyStack.current[
            locationKeyStack.current.length - 1
          ] = locationKey
          break
        }
        case 'POP': {
          const pointer = locationKeyStack.current.findIndex(
            (key) => key === locationKey
          )
          if (pointer > -1) {
            locationKeyStack.current = locationKeyStack.current.filter(
              (_, idx) => idx <= pointer
            )
          } else {
            locationKeyStack.current.push(locationKey)
          }
        }
      }
    })
  }, deps)
}

export function useHistoryReplaceEffect(
  callback: (location: Location<unknown>, action: Action) => void,
  deps?: DependencyList | undefined
) {
  const history = useHistory()

  useEffect(() => {
    return history.listen((location, action) => {
      if (action === 'REPLACE') {
        callback(location, action)
      }
    })
  }, deps)
}
