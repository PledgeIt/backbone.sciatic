import bb from 'backbone';
import Sciatic from '../../src/index';
import Router from '../../src/router';
import Route from '../../src/route';

describe('Sciatic', () => {
    it('should expose the Router constructor', () => {
        expect(Sciatic.Router).to.deep.equal(Router);
    });

    it('should expose the Route constructor', () => {
        expect(Sciatic.Route).to.deep.equal(Route);
    });

    it('should attach to Backbone', () => {
        expect(bb.Sciatic).to.deep.equal(Sciatic);
    });
});
