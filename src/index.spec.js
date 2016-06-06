/* eslint-env mocha */
import { assert } from "chai";
import aupair from "./index";

describe( "au-pair API", () => {
  beforeEach( () => {
    aupair.register( {
      name: "healthy",
      async check() {
        return { healthy: true };
      }
    } );
    aupair.register( {
      name: "unhealthy",
      async check() {
        return { healthy: false, timestamp: Date.parse( "11/30/2011" ) };
      }
    } );
  } );

  describe( "registration", () => {
    it( "should be able to register a configuration", () => {
      assert.isNotNull( aupair.getRegistrations().healthy );
      assert.isNotNull( aupair.getRegistrations().unhealthy );
    } );
  } );

  describe( "check", () => {
    let result;

    describe( "when not specifying any particular registration", () => {
      beforeEach( async () => {
        result = await aupair.check();
      } );

      it( "should return each individual result in the details", () => {
        assert.equal( result.details.length, 2 ); // eslint-disable-line no-magic-numbers
      } );

      it( "should return the correct healthy message", () => {
        assert.isFalse( result.healthy );
        assert.isTrue( result.details[ 0 ].healthy );
        assert.isFalse( result.details[ 1 ].healthy );
      } );

      it( "should return the correct name for each detail", () => {
        assert.equal( result.details[ 0 ].name, "healthy" );
        assert.equal( result.details[ 1 ].name, "unhealthy" );
      } );

      it( "should set timestamps", () => {
        assert.isNotNull( result.timestamp );
        assert.isNotNull( result.details[ 0 ].timestamp );
        assert.equal( result.details[ 1 ].timestamp, Date.parse( "11/30/2011" ) );
      } );
    } );

    describe( "when specifying an individual registration", () => {
      beforeEach( async () => {
        result = await aupair.check( "healthy" );
      } );

      it( "should only return the result specified", () => {
        assert.equal( result.details.length, 1 );
        assert.equal( result.details[ 0 ].name, "healthy" );
        assert.isTrue( result.healthy );
      } );
    } );
  } );
} );
