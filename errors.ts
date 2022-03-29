class CustomError extends Error {
    codenum: string
    level: "N" | "A" | "D"
    code = () => "E"+this.level+this.codenum;
}
class InternalError extends CustomError {}
class CommandError extends InternalError {
    resolve(message: import("discord.js").Message) {
        return message.channel.send("Error ["+this.name+"] occurred ("+this.code()+"): "+this.message);
    }
}
class CheckError extends CommandError {}
class Errors {
    static EN0000 = class extends CommandError {
        constructor(message="Parameter Error.") {
            super(message);
            this.name = "ParameterError";
            this.level = "N";
        }
    }
    static EN0001 = class extends this.EN0000 {
        constructor(message="Missing parameter.") {
            super(message);
            this.name = "MissingParameter";
            this.codenum = "0001";
            this.level = "N";
        }
    }
    static EN0002 = class extends this.EN0000 {
        constructor(message="Invalid parameter.") {
            super(message);
            this.name = "InvalidParameter";
            this.codenum = "0002";
            this.level = "N";
        }
    }
    /**
     * @deprecated Invalid parameter position is no longer be accepted.
     */
    static EN0003 = class extends this.EN0000 {
        constructor(message="Invalid parameter position.") {
            super(message);
            this.name = "InvalidParameterPosition";
            this.codenum = "0003";
            this.level = "N";
        }
    }
    static EN0110 = class extends CheckError {
        constructor(message="Missing permission.") {
            super(message);
            this.name = "MissingPermission";
            this.level = "N";
        }
    }
    static EN0111 = class extends this.EN0110 {
        constructor(message="Missing Developer permission.") {
            super(message);
            this.codenum = "0111";
        }
    }
    static EN0112 = class extends this.EN0110 {
        constructor(message="Missing Administraction permission.") {
            super(message);
            this.codenum = "0112";
        }
    }
    static EN0010 = class extends this.EN0000 {
        constructor(message="Missing permission.") {
            super(message);
            this.name = "FlagError";
            this.level = "N";
        }
    }
    static EN0011 = class extends this.EN0001 {
        constructor(message="Missing flag.") {
            super(message);
            this.name = "MissingFlag";
            this.codenum = "0011";
        }
    }
    static EN0012 = class extends this.EN0002 {
        constructor(message="Invalid flag.") {
            super(message);
            this.name = "InvalidFlag";
            this.codenum = "0012";
        }
    }
    /**
     * @deprecated
     */
    static EN0013 = class extends this.EN0003 {
        constructor(message="Invalid flag number.") {
            super(message);
            this.name = "InvalidFlagNumber";
            this.codenum = "0013";
        }
    }
    static EN0020 = class extends this.EN0010 {
        constructor(message="Flag Parameter Error.") {
            super(message);
            this.name = "FlagParameterError";
            this.level = "N";
        }
    }
    static EN0021 = class extends this.EN0001 {
        constructor(message="Missing flag parameter.") {
            super(message);
            this.name = "MissingFlagParameter";
            this.codenum = "0021";
        }
    }
    static EN0022 = class extends this.EN0002 {
        constructor(message="Missing flag parameter.") {
            super(message);
            this.name = "MissingFlagParameter";
            this.codenum = "0022";
        }
    }
    static EN1010 = class extends this.EN0000 {
        constructor(message="Flag Parameter Error.") {
            super(message);
            this.name = "SubcommandError";
            this.level = "N";
        }
    }
}
export {CustomError, InternalError, CommandError, Errors};