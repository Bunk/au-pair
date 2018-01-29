import joi from 'joi'
import moment from 'moment-precise-range'

const resultSchema = joi.object({
  name: joi.string(),
  healthy: joi.boolean(),
  degraded: joi.boolean(),
  error: joi.object().type(Error),
  message: joi.string(),
  timestamp: joi.date()
})
  .with('degraded', 'message')
  .nand('error', 'message')
  .requiredKeys('name', 'healthy')

const started = moment()

export default {
  map (...results) {
    // Allow either an array argument or spread arguments
    if (results.length === 1 && Array.isArray(results[ 0 ])) {
      results = results[ 0 ]
    }
    // Validate the inputs
    joi.assert(results, joi.array().items(resultSchema))

    const now = moment()
    let data = {
      healthy: true,
      degraded: false,
      details: [],
      upSince: started,
      upTime: moment.preciseDiff(started, now)
    }

    for (let result of results) {
      data.healthy &= result.healthy
      data.degraded |= result.degraded
      data.details.push({
        name: result.name,
        healthy: result.healthy,
        degraded: result.degraded,
        message: result.error || result.message,
        timestamp: moment(result.timestamp) || now
      })
    }

    // &= will have set this to an integer
    data.healthy = !!data.healthy
    data.degraded = !!data.degraded

    return data
  }
}
