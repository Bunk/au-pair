import _ from "lodash";
import transforms from "./transforms";

class AuPair {
  constructor( registrations ) {
    this.registrations = registrations;
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
      // TODO: Support synchronous calls
      return config.check()
        .then( result => Object.assign( result, { name: key } ) );
    } );

    return Promise.all( checks )
      .then( promises => transforms.map( promises ) );
  }
}

export default new AuPair( {} );
