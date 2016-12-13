import bb from 'backbone';
import Router from '../../src/router';
import Route from '../../src/route';

describe('Router', () => {
    let router, route;

    before(() => { bb.history.start({ pushState: true }); });

    beforeEach(() => {
        router = new Router();
        route = new Route({ router });
    });

    describe('navigate', () => {
        let bbNavigate;
        beforeEach(() => { bbNavigate = sinon.stub(bb.history, 'navigate'); });
        afterEach(() => { bbNavigate.restore(); });

        it('should call bb.history.navigate and pass args', () => {
            router.navigate('foo', { bar: 'baz' });
            expect(bbNavigate).to.have.been.calledOnce;
            expect(bbNavigate).to.have.been.calledWithExactly('foo', { bar: 'baz' });
        });

        it('should not call bb.history.navigate if currentRoute.preventNavigation = true', () => {
            route.preventNavigation = true;
            router.currentRoute = route;

            router.navigate('foo', { bar: 'baz' });
            expect(bbNavigate).to.not.have.been.called;
        });
    });
});
