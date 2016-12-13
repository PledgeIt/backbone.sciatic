import Router from '../../src/router';
import Route from '../../src/route';

describe('Route', () => {
    let router, route;

    beforeEach(() => {
        router = new Router();
        route = new Route({ router });
    });

    it('should store a reference to the router', () => {
        expect(route._router).to.deep.equal(router);
    });

    describe('navigate', () => {
        let routerNavigate;
        beforeEach(() => { routerNavigate = sinon.stub(router, 'navigate'); });
        afterEach(() => { routerNavigate.restore(); });

        it('should forward to router\'s navigate method', () => {
            route.navigate('foo', { bar: 'baz' });
            expect(routerNavigate).to.have.been.calledOnce;
            expect(routerNavigate).to.have.been.calledWithExactly('foo', { bar: 'baz' });
        });
    })
});
