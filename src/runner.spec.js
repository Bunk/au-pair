/* eslint-env mocha */
const { assert } = require('chai')
const sinon = require('sinon')
const runnerFactory = require('./runner')

describe('Runner', () => {
  let clock, opt, runner, check

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    opt = { logger: { error: sinon.stub() } }
  })

  afterEach(() => {
    clock.restore()
  })

  describe('start()', () => {
    context('given nothing has happened, yet', () => {
      beforeEach(async () => {
        runner = runnerFactory(opt)
        runner.start()
      })

      it('should have a default state', () => {
        assert.deepEqual(runner.currentState, {
          key: 'default',
          data: {
            status: 'pending',
            message: 'Initializing.'
          }
        })
      })
    })

    context('given the check succeeds', () => {
      beforeEach(() => {
        check = sinon.stub().resolves({ status: 'ok', message: 'Yay!' })
        runner = runnerFactory(Object.assign({check}, opt))
        runner.start()

        return check.firstCall.returnValue
      })

      it('should set the key in current state', () => {
        assert.equal(runner.currentState.key, 'default')
      })

      it('should set the data in current state', () => {
        assert.deepEqual(runner.currentState.data, { status: 'ok', message: 'Yay!' })
      })

      context('and then fails later on', () => {
        let failure
        beforeEach(async () => {
          check.onThirdCall().rejects(new Error('delayed-oops'))
          clock.tick(10000)

          failure = check.thirdCall.returnValue
        })

        it('should set the error in current state', () => {
          return failure.catch(err => {
            assert.equal(runner.currentState.data.err, err)
          })
        })

        it('should set the status to failed in current state', () => {
          return failure.catch(() => {
            assert.equal(runner.currentState.data.status, 'failed')
          })
        })
      })
    })

    context('given the check fails', () => {
      let promise
      beforeEach(async () => {
        check = sinon.stub().rejects(new Error('Woops!'))
        runner = runnerFactory(Object.assign({check}, opt))
        runner.start()

        promise = check.lastCall.returnValue
      })

      it('should set the key in current state', () => {
        return promise.catch(() => {
          assert.equal(runner.currentState.key, 'default')
        })
      })

      it('should set the error in current state', () => {
        return promise.catch(err => {
          assert.equal(runner.currentState.data.err, err)
        })
      })

      it('should set the status to failed in current state', () => {
        return promise.catch(() => {
          assert.equal(runner.currentState.data.status, 'failed')
        })
      })

      context('and then succeeds later on', () => {
        beforeEach(() => {
          check.onThirdCall().resolves({ status: 'ok', message: 'Yay!' })
          clock.tick(10000)
          return check.thirdCall.returnValue
        })

        it('should set the key in current state', () => {
          assert.equal(runner.currentState.key, 'default')
        })

        it('should set the data in current state', () => {
          assert.deepEqual(runner.currentState.data, { status: 'ok', message: 'Yay!' })
        })
      })
    })

    context('given an additional call to start()', () => {
      beforeEach(() => {
        runner = runnerFactory(opt)
        runner.start()
      })

      it('should throw an exception', () => {
        assert.throws(() => runner.start(), 'Already running a healthcheck for \'default\'')
      })
    })

    context('given the check is a passing synchronous method', () => {
      beforeEach(() => {
        check = () => ({ status: 'ok', message: 'Yay!' })
        runner = runnerFactory(Object.assign({check}, opt))
        runner.start()
      })

      it('should set the key in current state', () => {
        assert.equal(runner.currentState.key, 'default')
      })

      it('should set the data in current state', () => {
        assert.deepEqual(runner.currentState.data, { status: 'ok', message: 'Yay!' })
      })
    })

    context('given the check is a throwing synchronous method', () => {
      let err
      beforeEach(() => {
        err = new Error('Failed')
        check = () => { throw err }
        runner = runnerFactory(Object.assign({check}, opt))
        runner.start()
      })

      it('should set the key in current state', () => {
        assert.equal(runner.currentState.key, 'default')
      })

      it('should set the error in current state', () => {
        assert.deepEqual(runner.currentState.data.err, err)
      })

      it('should set the status to failed in current state', () => {
        assert.deepEqual(runner.currentState.data.status, 'failed')
      })
    })
  })

  describe('stop()', () => {
    context('given nothing has been started', () => {
      beforeEach(() => {
        check = sinon.stub().resolves({ status: 'ok', message: 'Yay!' })
        runner = runnerFactory(Object.assign({check}, opt))
        clock.tick(30000)
        runner.stop()
      })

      it('should not tick', () => {
        assert.notCalled(check)
      })
    })

    context('given the runner has been started', () => {
      beforeEach(() => {
        check = sinon.stub().resolves({ status: 'ok', message: 'Yay!' })
        runner = runnerFactory(Object.assign({check}, opt))

        // Tick 3 times
        runner.start()
        clock.tick(5000)
        clock.tick(5000)
        return check.lastCall.returnValue
      })

      it('should tick multiple times', () => {
        assert.calledThrice(check)
      })

      context('and is stopped', () => {
        beforeEach(() => {
          check.resetHistory()
          runner.stop()

          // Tick another 3 times
          clock.tick(5000)
          clock.tick(5000)
          clock.tick(5000)
        })

        it('should stop ticking', () => {
          assert.notCalled(check)
        })
      })
    })
  })
})
