/* eslint-env mocha */
/* eslint-disable no-magic-numbers */
const { assert } = require('chai')
const sinon = require('sinon')
const aupair = require('./index')

describe('aupair API', () => {
  let clock, promises
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    aupair.reset()
    clock.restore()
  })

  describe('start()', () => {
    beforeEach(() => {
      aupair.start()
    })

    it('should be active', () => {
      assert.isTrue(aupair.isActive)
    })

    context('given starting again', () => {
      it('should throw an error', () => {
        assert.throws(() => aupair.start())
      })
    })
  })

  describe('stop()', () => {
    context('given it is currently not running', () => {
      beforeEach(() => {
        aupair.stop()
      })

      it('should be inactive', () => {
        assert.isFalse(aupair.isActive)
      })
    })
  })

  describe('check()', () => {
    let state
    context('given all successful checks', () => {
      beforeEach(async () => {
        promises = [
          Promise.resolve({ status: 'ok', message: 'All good' }),
          Promise.resolve({ status: 'ok', message: 'Dope', extra: 'data' })
        ]

        aupair.addCheck({
          key: 'healthy_1',
          check: () => promises[0]
        })

        aupair.addCheck({
          key: 'healthy_2',
          check: () => promises[1]
        })

        aupair.start()

        await Promise.all(promises)

        state = aupair.check()
      })

      it('should return an `ok` status', () => {
        assert.equal(state.status, 'ok')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          },
          healthy_2: {
            status: 'ok',
            message: 'Dope',
            extra: 'data'
          }
        })
      })
    })

    context('given a single failing check', () => {
      let err
      beforeEach(async () => {
        err = new Error('Dang')
        promises = [
          Promise.resolve({ status: 'ok', message: 'All good' }),
          Promise.resolve({ status: 'failed', err }),
          Promise.resolve({ status: 'ok', message: 'Dope', extra: 'data' })
        ]

        aupair.addCheck({
          key: 'healthy_1',
          check: () => promises[0]
        })

        aupair.addCheck({
          key: 'failing_1',
          check: () => promises[1]
        })

        aupair.addCheck({
          key: 'healthy_2',
          check: () => promises[2]
        })

        aupair.start()

        await Promise.all(promises)

        state = aupair.check()
      })

      it('should return an `failed` status', () => {
        assert.equal(state.status, 'failed')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          },
          failing_1: {
            err: err,
            status: 'failed'
          },
          healthy_2: {
            status: 'ok',
            message: 'Dope',
            extra: 'data'
          }
        })
      })
    })

    context('given a single erroring check', () => {
      let err
      beforeEach(async () => {
        err = new Error('Dang')
        promises = [
          Promise.resolve({ status: 'ok', message: 'All good' }),
          Promise.reject(err),
          Promise.resolve({ status: 'pending', message: 'Dope' })
        ]

        aupair.addCheck({
          key: 'healthy_1',
          check: () => promises[0]
        })

        aupair.addCheck({
          key: 'erroring_1',
          check: () => promises[1]
        })

        aupair.addCheck({
          key: 'pending_1',
          check: () => promises[2]
        })

        aupair.start()

        await Promise.all(promises).catch(() => {})

        state = aupair.check()
      })

      it('should return an `failed` status', () => {
        assert.equal(state.status, 'failed')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          },
          pending_1: {
            status: 'pending',
            message: 'Dope'
          },
          erroring_1: {
            err: err,
            status: 'failed'
          }
        })
      })
    })

    context('given at least one pending check', () => {
      beforeEach(async () => {
        promises = [
          Promise.resolve({ status: 'ok', message: 'All good' }),
          Promise.resolve({ status: 'pending', message: 'Dope', extra: 'data' }),
          Promise.resolve({ status: 'ok', message: 'All good' })
        ]

        aupair.addCheck({
          key: 'healthy_1',
          check: () => promises[0]
        }, {
          key: 'pending_1',
          check: () => promises[1]
        }, {
          key: 'healthy_2',
          check: () => promises[2]
        })

        aupair.start()

        await Promise.all(promises)

        state = aupair.check()
      })

      it('should return a `pending` status', () => {
        assert.equal(state.status, 'pending')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          },
          healthy_2: {
            status: 'ok',
            message: 'All good'
          },
          pending_1: {
            status: 'pending',
            message: 'Dope',
            extra: 'data'
          }
        })
      })
    })

    context('given at least one failing check', () => {
      beforeEach(async () => {
        promises = [
          Promise.resolve({ status: 'ok', message: 'All good' }),
          Promise.resolve({ status: 'failed', message: 'Dope', extra: 'data' }),
          Promise.resolve({ status: 'pending', message: 'All good' })
        ]

        aupair.addCheck({
          key: 'healthy_1',
          check: () => promises[0]
        }, {
          key: 'failing_1',
          check: () => promises[1]
        }, {
          key: 'pending_1',
          check: () => promises[2]
        })

        aupair.start()

        await Promise.all(promises)

        state = aupair.check()
      })

      it('should return a `failed` status', () => {
        assert.equal(state.status, 'failed')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          },
          pending_1: {
            status: 'pending',
            message: 'All good'
          },
          failing_1: {
            status: 'failed',
            message: 'Dope',
            extra: 'data'
          }
        })
      })
    })

    context('given a synchronous check', () => {
      beforeEach(async () => {
        aupair.addCheck({
          key: 'healthy_1',
          check () {
            return { status: 'ok', message: 'All good' }
          }
        })

        aupair.start()

        state = aupair.check()
      })

      it('should return an `ok` status', () => {
        assert.equal(state.status, 'ok')
      })

      it('should return the correct details', () => {
        assert.deepEqual(state.details, {
          healthy_1: {
            status: 'ok',
            message: 'All good'
          }
        })
      })
    })
  })
})
