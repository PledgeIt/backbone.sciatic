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

        it('should return the router', () => {
            const result = router.navigate('foo', { bar: 'baz' });
            expect(result).to.deep.equal(router);
        });
    });

    describe('error', () => {
        const error = new Error('Test Error');

        let consoleErr;
        beforeEach(() => { consoleErr = sinon.stub(console, 'error'); });
        afterEach(() => { consoleErr.restore(); });

        it('should log the error out to the console', () => {
            router.error(error);
            expect(consoleErr).to.have.been.calledOnce;
            expect(consoleErr).to.have.been.calledWithExactly(error);
        });

        it('should return the router', () => {
            const result = router.error(error);
            expect(result).to.deep.equal(router);
        });
    });
});
