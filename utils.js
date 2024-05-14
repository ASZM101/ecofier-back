export class Option {
    constructor(value) {
        this.value = value;
    }

    static Some(value) {
        return new Option(value);
    }
    static None() {
        return new Option(null);
    }

    map(fn) {
        if (this.value === null) {
            return Option.None();
        }
        return Option.Some(fn(this.value));
    }

    flatMap(fn) {
        if (this.value === null) {
            return Option.None();
        }
        return fn(this.value);
    }

    getOrElse(defaultValue) {
        return this.value === null ? defaultValue : this.value;
    }

    getOrNull() {
        return this.value;
    }
}
export class Result {
    constructor(value_or_error) {
        this.value_or_error = value_or_error;
    }

    static Ok(value) {
        return new Result({ok: value, err: undefined});
    }
    static Err(error) {
        return new Result({ok: undefined, err: error});
    }

    isErr() {
        return this.value_or_error.err !== undefined;
    }

    inner() {
        return this.value_or_error;
    }
}

export function parseLoginAttempt(data) {
    const username = data.username;
    const hash = data.hash;
    if (username === undefined || hash === undefined) {
        return Option.None();
    }
    return Option.Some({username, hash});
}
export function parseUserCreationAttempt(data) {
    const username = data.username;
    const hash = data.hash;
    const salt = data.salt;
    if (username === undefined || hash === undefined || salt === undefined) {
        return Option.None();
    }
    return Option.Some({username, hash, salt});
}