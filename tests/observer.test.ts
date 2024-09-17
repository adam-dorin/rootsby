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
})