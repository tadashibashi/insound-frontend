class Callback<Ret, Args extends any[]> {
    private context?: any;
    private func: (...args: Args) => Ret;

    constructor(func: (...args: Args) => Ret, context?: any) {
        this.func = func;
        this.context = context;
    }

    invoke(...args: Args): Ret {
        return (this.context) ?
            this.func(...args) :
            this.func.apply(this.context, args);
    }

    equals(callback: Callback<Ret, Args>) {
        return this.func === callback.func &&
            this.context === callback.context;
    }
}

enum CommandType {
    Add,
    Remove,
}

interface Command<Ret, Args extends any[]> {
    callback: Callback<Ret, Args>;
    type: CommandType;
}

export class Delegate<Ret, Args extends any[]> {
    private handles: Callback<Ret, Args>[];
    private commands: Command<Ret, Args>[];
    private isInvoking: boolean;

    constructor() {
        this.handles = [];
        this.commands = [];
        this.isInvoking = false;
    }

    get handleCount() {
        return this.handles.length;
    }

    subscribe(func: (...args: Args) => Ret, context?: any) {
        const newCallback = new Callback(func, context);

        if (this.isInvoking) {
            this.commands.push({
                callback: newCallback,
                type:     CommandType.Add,
            });
        } else {
            this.addCallback(newCallback);
        }
    }

    unsubscribe(func: (...args: Args) => Ret, context?: any) {
        const toRemove = new Callback(func, context);

        if (this.isInvoking) {
            this.commands.push({
                callback: toRemove,
                type:     CommandType.Remove,
            });
        } else {
            this.removeCallback(toRemove);
        }
    }

    /**
     * Tries to invoke the handle, discarding return value and returning a
     * boolean indicating whether invoke was successful. For simplicity,
     * recursion is not allowed and will throw an error if attempted.
     *
     * @param  ...args - function arguments
     *
     * @return           whether invoke was successful.
     *
     * @throws any exception that may arise from subscribed callback functions,
     *         or if this delegate is invoked inside of one of the callbacks.
     */
    tryInvoke(...args: Args): boolean {
        if (this.isInvoking)
            throw Error("Delegate cannot be invoked while already invoking.");
        if (this.handles.length === 0) return false;

        this.isInvoking = true;
        for (let i = 0; i < this.handles.length; ++i) {
            this.handles[i].invoke(...args);
        }
        this.isInvoking = false;

        this.doCommands();

        return true;
    }

    /**
     * Invoke the callback, returning the first subscribed callback's return
     * value. For simplicity, recursion is not allowed and will throw an error
     * if attempted.
     *
     * @param   ...args   - arguments to pass to the callbacks
     *
     * @return  the first subscribed callback's return value
     *
     * @throws if there are no callback handles subscribed the the Delegate.
     *         Please make sure to check `Delegate#handleCount` before calling.
     *         Throws any other exception that may arise in callback functions,
     *         or if this function is invoked inside one of the callbacks.
     */
    invoke(...args: Args): Ret {
        try {
            if (this.isInvoking)
            {
                throw Error("Delegate cannot be invoked while already invoking.");
            }

            if (this.handles.length === 0)
            {
                throw Error("Cannot invoke Delegate without any handles");
            }

            this.isInvoking = true;
            const length = this.handles.length;
            const ret = this.handles[0].invoke(...args);

            for (let i = 1; i < length; ++i) {
                this.handles[i].invoke(...args);
            }
            this.isInvoking = false;

            this.doCommands();

            return ret;
        }
        catch(err)
        {
            this.isInvoking = false;
            throw err;
        }

    }

    private doCommands() {
        for (const cmd of this.commands) {
            switch (cmd.type) {
            case CommandType.Add:
                this.addCallback(cmd.callback);
                break;

            case CommandType.Remove:
                this.removeCallback(cmd.callback);
                break;

            default:
                throw Error("Unknown CommandType");
            }
        }

        this.commands.length = 0;
    }

    private addCallback(callback: Callback<Ret, Args>) {
        this.handles.push(callback);
    }

    private removeCallback(callback: Callback<Ret, Args>) {
        for (let i = 0; i < this.handles.length; ++i) {
            if (callback.equals(this.handles[i])) {
                this.handles.splice(i, 1);
                break;
            }
        }
    }
}
