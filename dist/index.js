'use strict'
var __create = Object.create
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __getProtoOf = Object.getPrototypeOf
var __hasOwnProp = Object.prototype.hasOwnProperty
var __commonJS = (cb, mod) =>
    function __require() {
        return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports
    }
var __export = (target, all) => {
    for (var name in all) __defProp(target, name, { get: all[name], enumerable: true })
}
var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, {
                    get: () => from[key],
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
                })
    }
    return to
}
var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
        // If the importer is in node compatibility mode or this is not an ESM
        // file that has been converted to a CommonJS file using a Babel-
        // compatible transform (i.e. "__esModule" has not been set), then set
        // "default" to the CommonJS "module.exports" for node compatibility.
        isNodeMode || !mod || !mod.__esModule ? __defProp(target, 'default', { value: mod, enumerable: true }) : target,
        mod
    )
)
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod)

// node_modules/@posthog/hogvm/dist/stl.js
var require_stl = __commonJS({
    'node_modules/@posthog/hogvm/dist/stl.js'(exports2) {
        'use strict'
        Object.defineProperty(exports2, '__esModule', { value: true })
        exports2.ASYNC_STL = exports2.STL = void 0
        exports2.STL = {
            concat: (args) => {
                return args.map((arg) => (arg === null ? '' : String(arg))).join('')
            },
            match: (args) => {
                const regex = new RegExp(args[1])
                return regex.test(args[0])
            },
            toString: (args) => {
                return String(args[0])
            },
            toUUID: (args) => {
                return String(args[0])
            },
            toInt: (args) => {
                return !isNaN(parseInt(args[0])) ? parseInt(args[0]) : null
            },
            toFloat: (args) => {
                return !isNaN(parseFloat(args[0])) ? parseFloat(args[0]) : null
            },
            ifNull: (args) => {
                return args[0] !== null ? args[0] : args[1]
            },
            length: (args) => {
                return args[0].length
            },
            empty: (args) => {
                return !args[0]
            },
            notEmpty: (args) => {
                return !!args[0]
            },
            lower: (args) => {
                return args[0].toLowerCase()
            },
            upper: (args) => {
                return args[0].toUpperCase()
            },
            reverse: (args) => {
                return args[0].split('').reverse().join('')
            },
            print: (args) => {
                console.log(...args)
            },
        }
        exports2.ASYNC_STL = {
            sleep: async (args) => {
                await new Promise((resolve) => setTimeout(resolve, args[0] * 1e3))
            },
        }
    },
})

// node_modules/@posthog/hogvm/dist/bytecode.js
var require_bytecode = __commonJS({
    'node_modules/@posthog/hogvm/dist/bytecode.js'(exports2) {
        'use strict'
        Object.defineProperty(exports2, '__esModule', { value: true })
        exports2.exec = exports2.execAsync = exports2.execSync = void 0
        var stl_1 = require_stl()
        var DEFAULT_MAX_ASYNC_STEPS = 100
        var DEFAULT_TIMEOUT = 5
        function like(string, pattern, caseInsensitive = false) {
            pattern = String(pattern)
                .replaceAll(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
                .replaceAll('%', '.*')
            return new RegExp(pattern, caseInsensitive ? 'i' : void 0).test(string)
        }
        function getNestedValue(obj, chain) {
            var _a
            if (typeof obj === 'object' && obj !== null) {
                for (const key of chain) {
                    if (typeof key === 'number') {
                        obj = obj[key]
                    } else {
                        obj = (_a = obj[key]) != null ? _a : null
                    }
                }
                return obj
            }
            return null
        }
        function execSync(bytecode, options) {
            const response = exec2(bytecode, options)
            if (response.finished) {
                return response.result
            }
            throw new Error('Unexpected async function call: ' + response.asyncFunctionName)
        }
        exports2.execSync = execSync
        async function execAsync(bytecode, options) {
            var _a
            let lastState = void 0
            while (true) {
                const response = exec2(bytecode, options, lastState)
                if (response.finished) {
                    return response.result
                }
                if (response.state && response.asyncFunctionName && response.asyncFunctionArgs) {
                    lastState = response.state
                    if (
                        (options == null ? void 0 : options.asyncFunctions) &&
                        response.asyncFunctionName in options.asyncFunctions
                    ) {
                        const result = await (options == null
                            ? void 0
                            : options.asyncFunctions[response.asyncFunctionName](...response.asyncFunctionArgs))
                        lastState.stack.push(result)
                    } else if (response.asyncFunctionName in stl_1.ASYNC_STL) {
                        const result = await stl_1.ASYNC_STL[response.asyncFunctionName](
                            response.asyncFunctionArgs,
                            response.asyncFunctionName,
                            (_a = options == null ? void 0 : options.timeout) != null ? _a : DEFAULT_TIMEOUT
                        )
                        lastState.stack.push(result)
                    } else {
                        throw new Error('Invalid async function call: ' + response.asyncFunctionName)
                    }
                } else {
                    throw new Error('Invalid async function call')
                }
            }
        }
        exports2.execAsync = execAsync
        function exec2(bytecode, options, vmState) {
            var _a, _b, _c
            if (bytecode.length === 0 || bytecode[0] !== '_h') {
                throw new Error("Invalid HogQL bytecode, must start with '_h'")
            }
            const startTime = Date.now()
            let temp
            const asyncSteps = vmState ? vmState.asyncSteps : 0
            const syncDuration = vmState ? vmState.syncDuration : 0
            const stack = vmState ? vmState.stack : []
            const callStack = vmState ? vmState.callStack : []
            const declaredFunctions = vmState ? vmState.declaredFunctions : {}
            let ip = vmState ? vmState.ip : 1
            let ops = vmState ? vmState.ops : 0
            const timeout = (_a = options == null ? void 0 : options.timeout) != null ? _a : DEFAULT_TIMEOUT
            const maxAsyncSteps =
                (_b = options == null ? void 0 : options.maxAsyncSteps) != null ? _b : DEFAULT_MAX_ASYNC_STEPS
            function popStack() {
                if (stack.length === 0) {
                    throw new Error('Invalid HogQL bytecode, stack is empty')
                }
                return stack.pop()
            }
            function next() {
                if (ip >= bytecode.length - 1) {
                    throw new Error('Unexpected end of bytecode')
                }
                return bytecode[++ip]
            }
            function checkTimeout() {
                if (syncDuration + Date.now() - startTime > timeout * 1e3) {
                    throw new Error(`Execution timed out after ${timeout} seconds`)
                }
            }
            for (; ip < bytecode.length; ip++) {
                ops += 1
                if ((ops & 127) === 0) {
                    checkTimeout()
                }
                switch (bytecode[ip]) {
                    case null:
                        break
                    case 32:
                        stack.push(next())
                        break
                    case 34:
                        stack.push(next())
                        break
                    case 33:
                        stack.push(next())
                        break
                    case 29:
                        stack.push(true)
                        break
                    case 30:
                        stack.push(false)
                        break
                    case 31:
                        stack.push(null)
                        break
                    case 5:
                        stack.push(!popStack())
                        break
                    case 3:
                        stack.push(
                            Array(next())
                                .fill(null)
                                .map(() => popStack())
                                .every(Boolean)
                        )
                        break
                    case 4:
                        stack.push(
                            Array(next())
                                .fill(null)
                                .map(() => popStack())
                                .some(Boolean)
                        )
                        break
                    case 6:
                        stack.push(Number(popStack()) + Number(popStack()))
                        break
                    case 7:
                        stack.push(Number(popStack()) - Number(popStack()))
                        break
                    case 9:
                        stack.push(Number(popStack()) / Number(popStack()))
                        break
                    case 8:
                        stack.push(Number(popStack()) * Number(popStack()))
                        break
                    case 10:
                        stack.push(Number(popStack()) % Number(popStack()))
                        break
                    case 11:
                        stack.push(popStack() === popStack())
                        break
                    case 12:
                        stack.push(popStack() !== popStack())
                        break
                    case 13:
                        stack.push(popStack() > popStack())
                        break
                    case 14:
                        stack.push(popStack() >= popStack())
                        break
                    case 15:
                        stack.push(popStack() < popStack())
                        break
                    case 16:
                        stack.push(popStack() <= popStack())
                        break
                    case 17:
                        stack.push(like(popStack(), popStack()))
                        break
                    case 18:
                        stack.push(like(popStack(), popStack(), true))
                        break
                    case 19:
                        stack.push(!like(popStack(), popStack()))
                        break
                    case 20:
                        stack.push(!like(popStack(), popStack(), true))
                        break
                    case 21:
                        temp = popStack()
                        stack.push(popStack().includes(temp))
                        break
                    case 22:
                        temp = popStack()
                        stack.push(!popStack().includes(temp))
                        break
                    case 23:
                        temp = popStack()
                        stack.push(new RegExp(popStack()).test(temp))
                        break
                    case 24:
                        temp = popStack()
                        stack.push(!new RegExp(popStack()).test(temp))
                        break
                    case 25:
                        temp = popStack()
                        stack.push(new RegExp(popStack(), 'i').test(temp))
                        break
                    case 26:
                        temp = popStack()
                        stack.push(!new RegExp(popStack(), 'i').test(temp))
                        break
                    case 1: {
                        const count = next()
                        const chain = []
                        for (let i = 0; i < count; i++) {
                            chain.push(popStack())
                        }
                        stack.push(
                            (options == null ? void 0 : options.fields) ? getNestedValue(options.fields, chain) : null
                        )
                        break
                    }
                    case 35:
                        popStack()
                        break
                    case 38:
                        if (callStack.length > 0) {
                            const [newIp, stackStart, _] = callStack.pop()
                            const response = popStack()
                            stack.splice(stackStart)
                            stack.push(response)
                            ip = newIp
                            break
                        } else {
                            return {
                                result: popStack(),
                                finished: true,
                            }
                        }
                    case 36:
                        temp = callStack.length > 0 ? callStack[callStack.length - 1][1] : 0
                        stack.push(stack[next() + temp])
                        break
                    case 37:
                        temp = callStack.length > 0 ? callStack[callStack.length - 1][1] : 0
                        stack[next() + temp] = popStack()
                        break
                    case 39:
                        temp = next()
                        ip += temp
                        break
                    case 40:
                        temp = next()
                        if (!popStack()) {
                            ip += temp
                        }
                        break
                    case 41: {
                        const name = next()
                        const argCount = next()
                        const bodyLength = next()
                        declaredFunctions[name] = [ip, argCount]
                        ip += bodyLength
                        break
                    }
                    case 2: {
                        checkTimeout()
                        const name = next()
                        if (name in declaredFunctions && name !== 'toString') {
                            const [funcIp, argLen] = declaredFunctions[name]
                            callStack.push([ip + 1, stack.length - argLen, argLen])
                            ip = funcIp
                        } else {
                            const args = Array(next())
                                .fill(null)
                                .map(() => popStack())
                            if (
                                (options == null ? void 0 : options.functions) &&
                                options.functions[name] &&
                                name !== 'toString'
                            ) {
                                stack.push(options.functions[name](...args))
                            } else if (
                                name !== 'toString' &&
                                (((options == null ? void 0 : options.asyncFunctions) &&
                                    options.asyncFunctions[name]) ||
                                    name in stl_1.ASYNC_STL)
                            ) {
                                if (asyncSteps >= maxAsyncSteps) {
                                    throw new Error(`Exceeded maximum number of async steps: ${maxAsyncSteps}`)
                                }
                                return {
                                    result: void 0,
                                    finished: false,
                                    asyncFunctionName: name,
                                    asyncFunctionArgs: args,
                                    state: {
                                        stack,
                                        callStack,
                                        declaredFunctions,
                                        ip: ip + 1,
                                        ops,
                                        asyncSteps: asyncSteps + 1,
                                        syncDuration: syncDuration + (Date.now() - startTime),
                                    },
                                }
                            } else if (name in stl_1.STL) {
                                stack.push(stl_1.STL[name](args, name, timeout))
                            } else {
                                throw new Error(`Unsupported function call: ${name}`)
                            }
                        }
                        break
                    }
                    default:
                        throw new Error(`Unexpected node while running bytecode: ${bytecode[ip]}`)
                }
            }
            if (stack.length > 1) {
                throw new Error('Invalid bytecode. More than one value left on stack')
            } else if (stack.length === 0) {
                return { result: null, finished: true }
            }
            return { result: (_c = popStack()) != null ? _c : null, finished: true }
        }
        exports2.exec = exec2
    },
})

// index.ts
var webhook_plugin_exports = {}
__export(webhook_plugin_exports, {
    composeWebhook: () => composeWebhook,
})
module.exports = __toCommonJS(webhook_plugin_exports)
var import_hogvm = __toESM(require_bytecode())
function composeWebhook(event, { config }) {
    const execOptions = {
        fields: {
            event,
        },
    }
    const bytecode = JSON.parse(config.bytecode)
    const res = (0, import_hogvm.exec)(bytecode, execOptions)
    const body = res.result
    return {
        url: config.url,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
    (module.exports = {
        composeWebhook,
    })
