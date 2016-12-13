import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import 'sinon-as-promised';

chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;

const testContext = require.context('./src/', true, /\.spec\.js$/);
testContext.keys().forEach(testContext);

const srcContext = require.context('../src/', true, /\.js$/);
srcContext.keys().forEach(srcContext);
