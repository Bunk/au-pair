import transforms from "./transforms";

let configurations = new Map();

export default {
  register( config ) {
    configurations.set( config.name, config );
  },
  get registrations() {
    const obj = Object.create( null );
    for ( const [ key, value ] of configurations ) {
      obj[ key ] = value;
    }
    return obj;
  },
  check( ...names ) {
    let configs = Array.from( configurations );
    if ( names && names.length ) {
      configs = configs.filter( ( [ key, config ] ) => names.indexOf( key ) >= 0 );
    }

    let checks = configs.map( ( [ key, config ] ) => {
      // TODO: Support synchronous calls
      return config.check()
        .then( result => Object.assign( result, { name: key } ) );
    } );

    return Promise.all( checks )
      .then( promises => transforms.map( promises ) );
  }
};
