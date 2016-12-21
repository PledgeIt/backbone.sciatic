import bb from 'backbone';
import Router from '../../src/router';
import Route from '../../src/route';

const RouteA = Route.extend({
    fetch() { return new Promise(resolve => setTimeout(resolve, 100)); },
});

const RouteB = Route.extend({
    fetch() { return new Promise(resolve => setTimeout(resolve, 150)); },
});

function relevantRouteData({ params, query, uriFragment }) { return { params, query, uriFragment }; }

describe('Router', () => {
    let router, route, routeData;

    beforeEach(() => {
        router = new Router();
        route = new Route({ router });

        routeData = {
            linked: RouteA,
            params: {},
            query: {},
            uriFragment: 'test',
            foo: 'foobar',
        };
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

    describe('onNavigate', () => {
        it('should return a promise', () => {
            const result = router.onNavigate(routeData);
            expect(result).to.be.an.instanceOf(Promise);
            return result;
        });

        it('should store a new instance of the route', () => {
            const result = router.onNavigate(routeData);
            expect(router._transitioningTo).to.be.an.instanceOf(RouteA);
            return result;
        });

        describe('without filters', () => {
            let fetch, show;

            beforeEach(() => {
                fetch = sinon.spy(RouteA.prototype, 'fetch');
                show = sinon.spy(RouteA.prototype, 'show');
            });

            afterEach(() => {
                fetch.restore();
                show.restore();
            });

            it('should not call route.show() until after route.fetch() has resolved', () => {
                return router.onNavigate(routeData).then(() => {
                    expect(fetch).to.have.been.calledOnce;
                    expect(show).to.have.been.calledOnce;
                    expect(show).to.have.been.calledAfter(fetch);
                });
            });

            it('should update the currentRoute after fetch() has resolved', () => {
                return router.onNavigate(routeData).then(() => {
                    expect(fetch).to.have.been.calledOnce;
                    expect(router.currentRoute).to.be.an.instanceOf(RouteA);
                });
            });
        });

        describe('when filters have been added to the route and/or router', () => {
            const routerB1 = sinon.stub().resolves();
            const routerB2 = sinon.stub().resolves();
            const routeB1 = sinon.stub().resolves();
            const routeB2 = sinon.stub().resolves();
            const routerA1 = sinon.stub().resolves();
            const routerA2 = sinon.stub().resolves();
            const routeA1 = sinon.stub().resolves();
            const routeA2 = sinon.stub().resolves();
            const fetch = sinon.stub().resolves();
            const show = sinon.stub().resolves();

            const FilterRoute = Route.extend({
                // Return filters inside a function to test _.result()
                filters() {
                    return [
                        { before: routeB1, after: routeA1 },
                        { after: routeA2 },
                        { before: routeB2 },
                        { before: this.routeB3 },
                    ];
                },

                fetch,
                show,

                routeB3: sinon.stub().resolves(),
            });

            let navigate, data;

            beforeEach(() => {
                navigate = sinon.spy();
                router.on('navigate', navigate);

                data = { ...routeData, linked: FilterRoute };

                router.filters = [
                    { before: routerB1, after: routerA1 },
                    { after: routerA2 },
                    { before: routerB2 },
                ];
            });

            afterEach(() => { router.off('navigate', navigate); });

            it('should call filters & lifecycle events in the correct order and with the correct context', () => {
                return router.onNavigate(data).then(() => {
                    const current = router.currentRoute;
                    const expectedData = relevantRouteData(data);

                    expect(current).to.be.an.instanceOf(FilterRoute);

                    expect(routerB1).to.have.been.calledOnce;
                    expect(routerB1).to.have.been.calledWithExactly(expectedData);
                    expect(routerB1.firstCall.thisValue).to.deep.equal(router);

                    expect(routerB2).to.have.been.calledOnce;
                    expect(routerB2).to.have.been.calledWithExactly(expectedData);
                    expect(routerB2.firstCall.thisValue).to.deep.equal(router);
                    expect(routerB2).to.have.been.calledAfter(routerB1);

                    expect(routeB1).to.have.been.calledOnce;
                    expect(routeB1).to.have.been.calledWithExactly(expectedData);
                    expect(routeB1.firstCall.thisValue).to.deep.equal(current);
                    expect(routeB1).to.have.been.calledAfter(routerB2);

                    expect(routeB2).to.have.been.calledOnce;
                    expect(routeB2).to.have.been.calledWithExactly(expectedData);
                    expect(routeB2.firstCall.thisValue).to.deep.equal(current);
                    expect(routeB2).to.have.been.calledAfter(routeB1);

                    expect(current.routeB3).to.have.been.calledOnce;
                    expect(current.routeB3).to.have.been.calledWithExactly(expectedData);
                    expect(current.routeB3.firstCall.thisValue).to.deep.equal(current);
                    expect(current.routeB3).to.have.been.calledAfter(routeB2);

                    expect(fetch).to.have.been.calledOnce;
                    expect(fetch).to.have.been.calledWithExactly(expectedData);
                    expect(fetch.firstCall.thisValue).to.deep.equal(current);
                    expect(fetch).to.have.been.calledAfter(current.routeB3);

                    expect(show).to.have.been.calledOnce;
                    expect(show).to.have.been.calledWithExactly(expectedData);
                    expect(show.firstCall.thisValue).to.deep.equal(current);
                    expect(show).to.have.been.calledAfter(fetch);

                    expect(routeA1).to.have.been.calledOnce;
                    expect(routeA1).to.have.been.calledWithExactly(expectedData);
                    expect(routeA1.firstCall.thisValue).to.deep.equal(current);
                    expect(routeA1).to.have.been.calledAfter(show);

                    expect(routeA2).to.have.been.calledOnce;
                    expect(routeA2).to.have.been.calledWithExactly(expectedData);
                    expect(routeA2.firstCall.thisValue).to.deep.equal(current);
                    expect(routeA2).to.have.been.calledAfter(routeA1);

                    expect(routerA1).to.have.been.calledOnce;
                    expect(routerA1).to.have.been.calledWithExactly(expectedData);
                    expect(routerA1.firstCall.thisValue).to.deep.equal(router);
                    expect(routerA1).to.have.been.calledAfter(routeA2);

                    expect(routerA2).to.have.been.calledOnce;
                    expect(routerA2).to.have.been.calledWithExactly(expectedData);
                    expect(routerA2.firstCall.thisValue).to.deep.equal(router);
                    expect(routerA2).to.have.been.calledAfter(routeA1);

                    expect(navigate).to.have.been.calledOnce;
                    expect(navigate).to.have.been.calledWithExactly(expectedData);
                    expect(navigate).to.have.been.calledAfter(routeA2);
                });
            });

            it('should ultimately resolve with the router', () => {
                return router.onNavigate(data)
                    .then(result => expect(result).to.deep.equal(router));
            });
        });

        describe('when another route is currently active (but already fulfilled)', () => {
            let oldRoute;

            beforeEach(() => {
                oldRoute = router.currentRoute = new RouteB({ router });
                sinon.spy(oldRoute, 'exit');
                sinon.spy(RouteA.prototype, 'fetch');
                sinon.spy(RouteA.prototype, 'show');
            });

            afterEach(() => {
                oldRoute.exit.restore();
                RouteA.prototype.fetch.restore();
                RouteA.prototype.show.restore();
            });

            it('call exit() on currently active route after fetch() and before show()', () => {
                return router.onNavigate(routeData).then(() => {
                    expect(oldRoute.exit).to.have.been.calledOnce;
                    expect(oldRoute.exit).to.have.been.calledWithExactly();
                    expect(oldRoute.exit).to.have.been.calledAfter(RouteA.prototype.fetch);
                    expect(oldRoute.exit).to.have.been.calledBefore(RouteA.prototype.show);
                });
            });
        });

        describe('when another route is still being fulfilled', () => {
            let navigate;

            beforeEach(() => {
                navigate = sinon.spy();
                router.on('navigate', navigate);

                sinon.stub(RouteB.prototype, 'fetch').returns(new Promise(resolve => setTimeout(resolve, 100)));
                sinon.spy(RouteB.prototype, 'show');
                sinon.spy(RouteA.prototype, 'fetch');
                sinon.spy(RouteA.prototype, 'show');
            });

            afterEach(() => {
                router.off('navigate', navigate);
                RouteB.prototype.fetch.restore();
                RouteB.prototype.show.restore();
                RouteA.prototype.fetch.restore();
                RouteA.prototype.show.restore();
            });

            it('should not run original route remaining lifecycle methods', () => {
                const firstData = {
                    ...routeData,
                    linked: RouteB,
                    param: { foo: 'foobar' },
                };

                return Promise.all([
                    router.onNavigate(firstData)
                        .then(result => expect(result).to.deep.equal(router)),

                    // Need to delay the second navigate call but long
                    // enough for the first one's fetch() to be called but
                    // not completed
                    new Promise(resolve => setTimeout(() => resolve(router.onNavigate(routeData)), 50)),
                ]).then(() => {
                    expect(RouteB.prototype.fetch).to.have.been.calledOnce;
                    expect(RouteB.prototype.fetch).to.have.been.calledWithExactly(relevantRouteData(firstData));
                    expect(RouteB.prototype.show).to.not.have.been.called;

                    expect(RouteA.prototype.fetch).to.have.been.calledOnce;
                    expect(RouteA.prototype.fetch).to.have.been.calledWithExactly(relevantRouteData(routeData));
                    expect(RouteA.prototype.show).to.have.been.calledOnce;
                    expect(RouteA.prototype.show).to.have.been.calledWithExactly(relevantRouteData(routeData));

                    expect(navigate).to.have.been.calledOnce;
                    expect(navigate).to.have.been.calledWithExactly(relevantRouteData(routeData));
                });
            });
        });

        describe('on successful promise chain', () => {
            it('should trigger a "navigate" event on itself', () => {
                const spy = sinon.spy();
                router.on('navigate', spy);

                return router.onNavigate(routeData).then(() => {
                    expect(spy).to.have.been.calledOnce;
                    expect(spy).to.have.been.calledWithExactly(relevantRouteData(routeData));
                    router.off('navigate', spy);
                });
            });

            it('should remove it\'s reference to the route being transitioned to', () => {
                return router.onNavigate(routeData).then(() => {
                    expect(router._transitioningTo).to.be.undefined;
                    expect(router.currentRoute).to.be.an.instanceOf(RouteA);
                });
            });

            it('should ultimately resolve with the router', () => {
                return router.onNavigate(routeData).then(result => expect(result).to.deep.equal(router));
            });
        });

        describe('on an error', () => {
            const testError = { message: 'Test Error' };

            let fetch;
            beforeEach(() => { fetch = sinon.stub(RouteA.prototype, 'fetch').rejects(testError); });
            afterEach(() => { fetch.restore(); });

            it('should pass to route.error()', () => {
                const routeError = RouteA.prototype.error = sinon.spy();

                return router.onNavigate(routeData).then(() => {
                    expect(routeError).to.have.been.calledOnce;
                    expect(routeError).to.have.been.calledWithExactly(testError, relevantRouteData(routeData));
                    delete RouteA.prototype.error;
                });
            });

            it('should pass to own error() if route.error() does not exist', () => {
                const routerError = sinon.stub(router, 'error');

                return router.onNavigate(routeData).then(() => {
                    expect(routerError).to.have.been.calledOnce;
                    expect(routerError).to.have.been.calledWithExactly(testError, relevantRouteData(routeData));
                    routerError.restore();
                });
            });
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
