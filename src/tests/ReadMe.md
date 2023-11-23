# Insound Frontend Tests

This directory is for unit tests using the Bun testing suite.

To run tests call: `bun test <this-directory>`

UI and browser testing is not implemented yet, but when it is it may use:
https://bun.sh/docs/test/dom

To write tests, import the exports in `index.ts` like so:
```typescript
import {describe, it, expect} from ".";

describe("math tests", () => {
    it("one plus two is three", () => {
        expect(1 + 2).toBe(3);
    });

    // ...
});
```
