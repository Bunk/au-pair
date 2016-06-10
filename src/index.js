import _ from "lodash";
import transforms from "./transforms";

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

      let promise;
      if ( config.then && _.isFunction( config.then ) ) {
        promise = config.then;
      } else {
        try {
          const result = config.check();
          promise = Promise.resolve( result );
        } catch ( err ) {
          promise = Promise.reject( err );
        }
      }

      return promise.then( result => Object.assign( result, { name: key } ) );
    } );

    return Promise.all( checks )
      .then( results => transforms.map( results ) );
  }
}

const defaultInstance = new AuPair();

export default defaultInstance;
