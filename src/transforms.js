import joi from "joi";
import moment from "moment-precise-range";

const resultSchema = joi.object().keys( {
  name: joi.string(),
  healthy: joi.boolean(),
  error: joi.string(),
  timestamp: joi.date()
} ).requiredKeys( "name", "healthy" );

const started = Date.now();

export default {
  map( ...results ) {
    if ( results.length === 1 && Array.isArray( results[ 0 ] ) ) {
      results = results[ 0 ];
    }

    joi.assert( results, joi.array().items( resultSchema ) );

    const now = new Date();
    let data = {
      healthy: true,
      details: [],
      upSince: started,
      upTime: moment.preciseDiff( started, Date.now() )
    };

    for ( let result of results ) {
      data.healthy &= result.healthy;
      data.details.push( {
        name: result.name,
        healthy: result.healthy,
        message: result.healthy ? "" : result.error,
        timestamp: result.timestamp || now
      } );
    }

    // &= will have set this to an integer
    data.healthy = !!data.healthy;

    return data;
  }
};
