import moment from "moment-precise-range";

const started = Date.now();

export default {
  map( resultArray ) {
    const now = new Date();
    let data = {
      healthy: true,
      details: [],
      upSince: started,
      upTime: moment.preciseDiff( started, Date.now() )
    };

    for ( let result of resultArray ) {
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
