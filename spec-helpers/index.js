/* global testHelpers */
import chai from "chai";
import sinon from "sinon";
import pkg from "../package.json";
import appFactory from "../src";

require( "sinon-as-promised" );

sinon.assert.expose( chai.assert, { prefix: "" } );

global.testHelpers = {
  assert: chai.assert,
  appFactory,
  sinon,
  pkg
};

export default testHelpers;
