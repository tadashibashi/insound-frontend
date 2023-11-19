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

    invoke(...args: Args) {
        if (this.isInvoking)
            throw Error("Delegate cannot be invoked while already invoking.");

        this.isInvoking = true;
        for (let i = 0; i < this.handles.length; ++i) {
            this.handles[i].invoke(...args);
        }
        this.isInvoking = false;

        this.doCommands();
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
