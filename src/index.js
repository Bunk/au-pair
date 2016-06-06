import _ from "lodash";
import transforms from "./transforms";

const promisify = async fn => {
  if ( fn.then ) {
    return fn();
  }
  try {
    const result = fn();
    return Promise.resolve( result );
  } catch ( err ) {
    return Promise.reject( err );
  }
};

class AuPair {
  constructor( registrations ) {
    this.registrations = registrations || {};
  }

  register( config ) {
    this.registrations[ config.name ] = config;
  }

  check( ...names ) {
    let regs = _.map( this.registrations, ( value, key ) => [ key, value ] );
    if ( names && names.length ) {
      regs = regs.filter( ( [ key, config ] ) => names.indexOf( key ) >= 0 );
    }

    let checks = regs.map( ( [ key, config ] ) => {
      if ( !config.check ) {
        throw new Error( "An AuPair configuration must have a `check` function" );
      }

      const promise = promisify( config.check );
      return promise.then( result => Object.assign( result, { name: key } ) );
    } );

    return Promise.all( checks )
      .then( promises => transforms.map( promises ) );
  }
}

const defaultInstance = new AuPair();

export default defaultInstance;
