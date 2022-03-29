var _a;
class CustomError extends Error {
    constructor() {
        super(...arguments);
        this.code = () => "E" + this.level + this.codenum;
    }
}
class InternalError extends CustomError {
}
class CommandError extends InternalError {
    resolve(message) {
        return message.channel.send("Error [" + this.name + "] occurred (" + this.code() + "): " + this.message);
    }
}
class CheckError extends CommandError {
}
class Errors {
}
_a = Errors;
Errors.EN0000 = class extends CommandError {
    constructor(message = "Parameter Error.") {
        super(message);
        this.name = "ParameterError";
        this.level = "N";
    }
};
Errors.EN0001 = class extends _a.EN0000 {
    constructor(message = "Missing parameter.") {
        super(message);
        this.name = "MissingParameter";
        this.codenum = "0001";
        this.level = "N";
    }
};
Errors.EN0002 = class extends _a.EN0000 {
    constructor(message = "Invalid parameter.") {
        super(message);
        this.name = "InvalidParameter";
        this.codenum = "0002";
        this.level = "N";
    }
};
/**
 * @deprecated Invalid parameter position is no longer be accepted.
 */
Errors.EN0003 = class extends _a.EN0000 {
    constructor(message = "Invalid parameter position.") {
        super(message);
        this.name = "InvalidParameterPosition";
        this.codenum = "0003";
        this.level = "N";
    }
};
Errors.EN0110 = class extends CheckError {
    constructor(message = "Missing permission.") {
        super(message);
        this.name = "MissingPermission";
        this.level = "N";
    }
};
Errors.EN0111 = class extends _a.EN0110 {
    constructor(message = "Missing Developer permission.") {
        super(message);
        this.codenum = "0111";
    }
};
Errors.EN0112 = class extends _a.EN0110 {
    constructor(message = "Missing Administraction permission.") {
        super(message);
        this.codenum = "0112";
    }
};
Errors.EN0010 = class extends _a.EN0000 {
    constructor(message = "Missing permission.") {
        super(message);
        this.name = "FlagError";
        this.level = "N";
    }
};
Errors.EN0011 = class extends _a.EN0001 {
    constructor(message = "Missing flag.") {
        super(message);
        this.name = "MissingFlag";
        this.codenum = "0011";
    }
};
Errors.EN0012 = class extends _a.EN0002 {
    constructor(message = "Invalid flag.") {
        super(message);
        this.name = "InvalidFlag";
        this.codenum = "0012";
    }
};
/**
 * @deprecated
 */
Errors.EN0013 = class extends _a.EN0003 {
    constructor(message = "Invalid flag number.") {
        super(message);
        this.name = "InvalidFlagNumber";
        this.codenum = "0013";
    }
};
Errors.EN0020 = class extends _a.EN0010 {
    constructor(message = "Flag Parameter Error.") {
        super(message);
        this.name = "FlagParameterError";
        this.level = "N";
    }
};
Errors.EN0021 = class extends _a.EN0001 {
    constructor(message = "Missing flag parameter.") {
        super(message);
        this.name = "MissingFlagParameter";
        this.codenum = "0021";
    }
};
Errors.EN0022 = class extends _a.EN0002 {
    constructor(message = "Missing flag parameter.") {
        super(message);
        this.name = "MissingFlagParameter";
        this.codenum = "0022";
    }
};
Errors.EN1010 = class extends _a.EN0000 {
    constructor(message = "Flag Parameter Error.") {
        super(message);
        this.name = "SubcommandError";
        this.level = "N";
    }
};
export { CustomError, InternalError, CommandError, Errors };
//# sourceMappingURL=errors.js.map