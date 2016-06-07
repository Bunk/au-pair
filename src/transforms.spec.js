/* eslint-env mocha */
/* eslint-disable no-magic-numbers */
import { assert } from "chai";
import transforms from "./transforms";

function validObj( additional ) {
  return Object.assign( { name: "1", healthy: true }, additional );
}

describe( "Transforms", () => {
  let result;
  describe( "validations", () => {
    it( "should allow an array of values", () => {
      assert.doesNotThrow( () => transforms.map( [ validObj() ] ) );
    } );
    it( "should allow spread parameters", () => {
      assert.doesNotThrow( () => transforms.map( validObj(), validObj( { name: "2" } ) ) );
    } );
    it( "should require `name`", () => {
      assert.throws( () => transforms.map( { healthy: true } ) );
    } );
    it( "should require `healthy`", () => {
      assert.throws( () => transforms.map( { name: "1" } ) );
    } );
    it( "should require `healthy` to be a boolean", () => {
      assert.throws( () => transforms.map( validObj( { healthy: "something" } ) ) );
    } );
    it( "should require `degraded` to be a boolean", () => {
      assert.throws( () => transforms.map( validObj( { degraded: "blah", message: "blah" } ) ) );
    } );
    it( "should require a `message` when `degraded`", () => {
      assert.throws( () => transforms.map( validObj( { degraded: true } ) ) );
    } );
    it( "should require `error` to be an Error object", () => {
      assert.throws( () => transforms.map( validObj( { error: "blah" } ) ) );
    } );
    it( "should require `message` to be a string object", () => {
      assert.throws( () => transforms.map( validObj( { message: {} } ) ) );
    } );
    it( "should not allow both `error` and `message`", () => {
      assert.throws( () => transforms.map( validObj( { error: new Error( "Boo" ), message: "blah" } ) ) );
    } );
    it( "should allow either `error` or `message`", () => {
      assert.doesNotThrow( () => transforms.map( validObj( { error: new Error( "Boo" ) } ) ) );
      assert.doesNotThrow( () => transforms.map( validObj( { message: "blah" } ) ) );
    } );
    it( "should allow `timestamp` to be a date", () => {
      assert.doesNotThrow( () => transforms.map( validObj( { timestamp: new Date() } ) ) );
    } );
    it( "should allow `timestamp` to be a date string", () => {
      assert.doesNotThrow( () => transforms.map( validObj( { timestamp: "1-1-2016" } ) ) );
    } );
  } );

  describe( "overall status", () => {
    it( "should return healthy without dependencies", () => {
      assert.isTrue( transforms.map( [] ).healthy );
    } );
    it( "should return healthy with all passing dependencies", () => {
      const dependencies = [ validObj(), validObj() ];
      assert.isTrue( transforms.map( dependencies ).healthy );
    } );
    it( "should return unhealthy with a failing dependency", () => {
      const dependencies = [ validObj(), validObj( { healthy: false } ) ];
      assert.isFalse( transforms.map( dependencies ).healthy );
    } );
  } );

  describe( "degraded status", () => {
    it( "should return not degraded without dependencies", () => {
      assert.isFalse( transforms.map( [] ).degraded );
    } );
    it( "should return not degraded with all not degraded dependencies", () => {
      const dependencies = [ validObj(), validObj() ];
      assert.isFalse( transforms.map( dependencies ).degraded );
    } );
    it( "should return degraded with a degraded dependency", () => {
      const dependencies = [ validObj(), validObj( { degraded: true, message: "blah" } ) ];
      assert.isTrue( transforms.map( dependencies ).degraded );
    } );
  } );
} );
