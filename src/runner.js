const defaultCheck = async () => {
  return {
    status: 'pending',
    message: 'Initializing.'
  }
}

module.exports = ({ key = 'default', interval = 5000, check = defaultCheck }) => {
  let intervalHandle
  let currentState

  return {
    start () {
      // Only start one timer per runner
      if (intervalHandle) {
        throw new Error(`Already running a healthcheck for '${key}'`)
      }

      const tick = () => {
        currentState = { key }
        try {
          const result = check()
          if (result && result.then && (typeof result.then === 'function')) {
            result
              .then(data => (currentState.data = data))
              .catch(err => (currentState.data = { status: 'failed', err }))
          } else {
            currentState.data = result
          }
        } catch (err) {
          currentState.data = { status: 'failed', err }
        }
      }

      // Tick immediately to setup the first state
      tick()

      // Setup a timer
      intervalHandle = setInterval(tick, interval)
    },
    stop () {
      // Only stop the interval if we've started one
      if (intervalHandle) {
        clearInterval(intervalHandle)
      }
    },
    get currentState () {
      return currentState
    }
  }
}
