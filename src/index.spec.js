/* eslint-env mocha */
import { assert } from "chai";

describe( "core", () => {
  let core;

  beforeEach( () => {
    core = require( "./index.js" );
  } );

  it( "should have the default value", () => {
    assert.equal( core.property, "blah" );
  } );
} );
