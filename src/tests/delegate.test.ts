import {it, describe, expect} from "bun:test";
import { Delegate } from "app/util/delegate";

describe("Delegate can subscribe & unsubscribe callbacks", () => {

    it("works on non-member functions", () => {
        const delegate = new Delegate<number, []>;

        expect(delegate.handleCount).toBe(0);

        const func = () => 1234;

        delegate.subscribe(func);
        expect(delegate.handleCount).toBe(1);

        delegate.unsubscribe(func);
        expect(delegate.handleCount).toBe(0);
    });

    it("works on multiple functions", () => {
        const delegate = new Delegate<number, []>;

        expect(delegate.handleCount).toBe(0);

        const func0 = () => 1234;
        const func1 = () => 5678;

        delegate.subscribe(func0);
        expect(delegate.handleCount).toBe(1);

        delegate.subscribe(func1);
        expect(delegate.handleCount).toBe(2);

        delegate.unsubscribe(func0);
        expect(delegate.handleCount).toBe(1);

        delegate.unsubscribe(func1);
        expect(delegate.handleCount).toBe(0);
    });

    it("works on member functions", () => {
        const delegate = new Delegate<number, []>;

        const obj = {
            func() {
                return 5678;
            }
        };

        expect(delegate.handleCount).toBe(0);

        delegate.subscribe(obj.func, obj);
        expect(delegate.handleCount).toBe(1);

        delegate.unsubscribe(obj.func, obj);
        expect(delegate.handleCount).toBe(0);
    });

    it("works on both non-member & member functions", () => {
        const delegate = new Delegate<number, []>;
        const func = () => 1234;
        const obj = {
            func() {
                return 5678;
            }
        };

        expect(delegate.handleCount).toBe(0);

        delegate.subscribe(obj.func, obj);
        expect(delegate.handleCount).toBe(1);

        delegate.subscribe(func);
        expect(delegate.handleCount).toBe(2);

        delegate.unsubscribe(obj.func, obj);
        expect(delegate.handleCount).toBe(1);

        delegate.unsubscribe(func);
        expect(delegate.handleCount).toBe(0);
    });
});

describe("Delegate can invoke callbacks", () => {

    it("throws if there is no callback subscribed", () => {
        const delegate = new Delegate<void, []>;
        expect(() => delegate.invoke()).toThrow();
    });

    it("returns callback value on non-member functions", () => {
        const delegate = new Delegate<number, []>;

        const func = () => 1234;

        delegate.subscribe(func);

        expect(delegate.invoke()).toBe(1234);
    });

    it("returns first callback value on non-member functions", () => {
        const delegate = new Delegate<number, []>;

        const func0 = () => 9999;
        const func1 = () => 1111;

        delegate.subscribe(func0);
        delegate.subscribe(func1);

        expect(delegate.invoke()).toBe(9999);
    });

});
