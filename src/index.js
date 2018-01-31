const runnerFactory = require('./runner')
const moment = require('moment')
require('moment-precise-range-plugin')

const started = moment()

class AuPair {
  constructor () {
    this.isActive = false
    this.checks = new Set()
    this.runners = {}
  }

  addCheck (...checks) {
    for (const check of checks) {
      this.checks.add(check)
    }
  }

  start () {
    if (this.isActive) {
      throw new Error('Health checks are already active')
    }

    this.isActive = true

    for (const check of this.checks) {
      const runner = (
        this.runners[check.key] = runnerFactory(check)
      )
      runner.start()
    }
  }

  stop () {
    if (!this.isActive) return
    for (const [, runner] of Object.entries(this.runners)) {
      runner.stop()
    }
  }

  check () {
    const state = {
      status: 'ok',
      started: started,
      uptime: moment.preciseDiff(started, moment())
    }

    let pending = false
    let failed = false

    for (const [key, runner] of Object.entries(this.runners)) {
      if (!state.details) state.details = {}

      const { data } = runner.currentState
      pending |= data.status === 'pending'
      failed |= data.status === 'failed'
      state.details[key] = data
    }

    state.status = failed ? 'failed' : pending ? 'pending' : state.status

    return state
  }

  reset () {
    this.stop()

    this.isActive = false
    this.checks = new Set()
    this.runners = {}
  }
}

module.exports = new AuPair()
