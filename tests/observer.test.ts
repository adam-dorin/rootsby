import { Observable } from '../src/observer';

describe('Observer tests', () => {

    let observer: Observable<boolean> = new Observable<boolean>();

    beforeEach(() => {
        observer = new Observable<boolean>();
    });

    // 1. Subscribing actually works
    // 2. Pushing works
    // 3. Unsubscribing from a subscription works
    // 4. UnsubscribeAll Works as expected

    test('pushing should trigger the subscribe function', done => {
        const sub = observer.subscribe('test-push-sub', value => {
            expect(value).toBe(true);
            done();
        });
        observer.push('test-push-sub', true);
        observer.unsubscribeAll('test-push-sub');
        sub.unsubscribe();
    })

    test('pushing should trigger logger function', done => {
        observer.setLogger((name, data) => {
            expect(name).toBe('test-push-sub');
            expect(data).toBe(true);
            done();
        });
        const sub = observer.subscribe('test-push-sub', value => {
            expect(value).toBe(true);  
        });
        observer.push('test-push-sub', true);
        observer.unsubscribeAll('test-push-sub');
        sub.unsubscribe();
    })

    test('cache should work as expected', done => {
        const obs = new Observable<boolean>(true);
        obs.push('test-cache', true);
        const sub = obs.subscribe('test-cache', value => {
            expect(value).toBe(true);
            done();
        });
        sub.unsubscribe();
        obs.unsubscribeAll('test-cache');
    })

    test('unsubscribe should stop receiving updates', done => {
        const sub = observer.subscribe('test-unsubscribe', value => {
            done(new Error('Should not receive updates after unsubscribe'));
        });
        sub.unsubscribe();
        observer.push('test-unsubscribe', true);
        setTimeout(() => done(), 20);
    })
})