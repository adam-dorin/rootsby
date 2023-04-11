#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var conf_1 = require("conf");
var captureStdin = function (q) {
    return new Promise(function (resolve, reject) {
        var readline = require("readline");
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        function query(question) {
            rl.question(question, function (answer) {
                if (answer === "-e") {
                    process.exit(1);
                }
                resolve(answer);
                rl.close();
            });
        }
        query("\n".concat(q, "\ntype -e to quit\n\n\u276F\u276F\u276F "));
    });
};
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var program, pkg, config;
        return __generator(this, function (_a) {
            program = require("commander").program;
            pkg = require("./package.json");
            config = new conf_1.Conf["default"]({ projectName: "rootsby-cli" });
            program.version(pkg.version);
            program
                .command("prompt")
                .argument("[name]", "Name of the prompt", "")
                .argument("[text...]", "Text to use for the prompt", "")
                .description("Prompt management")
                .option("-l, --list", "List all prompts")
                .option("-s, --set", "Set a prompt")
                .option("-d, --delete", "Delete a prompt")
                .action(function (name, text, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var prompt_list, fromStdin, prompt_list, prompt_list, index, prompt_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                //   console.log("Prompt name: " + name);
                                //   console.log("Text: " + JSON.stringify(text));
                                //   console.log("Options: " + JSON.stringify(options));
                                if (options.list) {
                                    prompt_list = config.get("prompt_list") || [];
                                    if (prompt_list.length === 0) {
                                        console.log("No prompts. Create one first. using -s or --set");
                                        return [2 /*return*/];
                                    }
                                    prompt_list.map(function (promptName, index) {
                                        console.log("".concat(index + 1, ". ").concat(promptName));
                                    });
                                    return [2 /*return*/];
                                }
                                if (!(name && options.set)) return [3 /*break*/, 3];
                                fromStdin = false;
                                if (!!text) return [3 /*break*/, 2];
                                return [4 /*yield*/, captureStdin("What is the text for the prompt?")];
                            case 1:
                                text = _a.sent();
                                fromStdin = true;
                                _a.label = 2;
                            case 2:
                                prompt_list = config.get("prompt_list") || [];
                                if (prompt_list.indexOf(name) === -1) {
                                    prompt_list.push(name);
                                    config.set("prompt_list", prompt_list);
                                }
                                config.set("prompts.".concat(name), fromStdin ? text : text.join(" "));
                                return [2 /*return*/];
                            case 3:
                                if (name && options["delete"]) {
                                    prompt_list = config.get("prompt_list") || [];
                                    index = prompt_list.indexOf(name);
                                    if (index > -1) {
                                        prompt_list.splice(index, 1);
                                        config.set("prompt_list", prompt_list);
                                        config["delete"]("prompts.".concat(name));
                                        console.log("Prompt ".concat(name, " was deleted."));
                                    }
                                    else {
                                        console.log("Prompt ".concat(name, " does not exist."));
                                    }
                                }
                                if (name && !options.set && !options.set) {
                                    prompt_1 = config.get("prompts.".concat(name));
                                    console.log(prompt_1);
                                    return [2 /*return*/];
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            });
            program
                .command("ask")
                .argument("[text...]", "Text to use for the prompt", "")
                .description("Execute a prompt using the text")
                .option("-e, --exec [prompt_name]", "Name of the prompt to execute")
                .option("--api_key [key_value]", "Value of the api key")
                .action(function (text, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var prompt_2, prompt_list, openAiKey, example, prompt_3, ask, promptIndex, prompt_4, ask;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!!text) return [3 /*break*/, 2];
                                return [4 /*yield*/, captureStdin("What is the text for the prompt?")];
                            case 1:
                                text = _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                text = text.join(" ").trim();
                                _a.label = 3;
                            case 3:
                                // if options.exec is set, and the prompt exists then execute the prompt using the text
                                if (text && options.exec && typeof options.exec === "string") {
                                    prompt_2 = config.get("prompts.".concat(options.exec));
                                    if (prompt_2) {
                                        console.log(prompt_2);
                                    }
                                }
                                if (!(text && !options.exec)) return [3 /*break*/, 9];
                                prompt_list = config.get("prompt_list") || [];
                                openAiKey = options.api_key || config.get("config_keys.open_ai_api_key");
                                if (!openAiKey) {
                                    console.log("No OpenAI API key. Set one firs, or pass it as an option using --api_key ");
                                    example = "Example: \n ";
                                    example += "ry ask \"Hello world\" --api_key \"sk-1234567890abcdefg\"\nor\n";
                                    example += "ry config set open_ai_api_key \"sk-1234567890abcdefg\"\nry ask \"Hello world\"";
                                    console.log(example);
                                    return [2 /*return*/];
                                }
                                if (prompt_list.length === 0) {
                                    console.log("No prompts. Create one first. ");
                                    return [2 /*return*/];
                                }
                                if (!(prompt_list.length === 1)) return [3 /*break*/, 5];
                                console.log("Only one prompt");
                                prompt_3 = config.get("prompts.".concat(prompt_list[0]));
                                ask = require("./commands/ask");
                                return [4 /*yield*/, ask(prompt_3, text, openAiKey)];
                            case 4: 
                            // execute the prompt
                            return [2 /*return*/, _a.sent()];
                            case 5:
                                if (!(prompt_list.length > 1)) return [3 /*break*/, 9];
                                // go with the simplest option show a numbered list of prompts and ask the user to select one
                                prompt_list.map(function (promptName, index) {
                                    console.log("".concat(index + 1, ". ").concat(promptName));
                                });
                                return [4 /*yield*/, captureStdin("Which prompt do you want to execute? (number)")];
                            case 6:
                                promptIndex = _a.sent();
                                promptIndex = parseInt(promptIndex);
                                if (!(!Number.isNaN(promptIndex) &&
                                    promptIndex > 0 &&
                                    promptIndex <= prompt_list.length)) return [3 /*break*/, 8];
                                prompt_4 = config.get("prompts.".concat(prompt_list[promptIndex - 1]));
                                if (!prompt_4) return [3 /*break*/, 8];
                                ask = require("./commands/ask");
                                return [4 /*yield*/, ask(prompt_4, text, openAiKey)];
                            case 7:
                                _a.sent();
                                _a.label = 8;
                            case 8: return [2 /*return*/];
                            case 9: return [2 /*return*/];
                        }
                    });
                });
            });
            program
                .command("config")
                .argument("[key]", "The config key, to be accessed", "")
                .argument("[value]", "The config value, to be set", "")
                .description("Access the configuration")
                .option("-s, --set", "Paired key value to set in the config")
                .option("-d, --delete", "Key to delete from the config")
                .option("--full", "Output the full config")
                .action(function (key, value, options) {
                console.log("Options: " + JSON.stringify(options));
                console.log("Key: " + JSON.stringify(key));
                console.log("Value: " + JSON.stringify(value));
                if (!config.has("config_keys")) {
                    config.set("config_keys", {});
                }
                if (options.full) {
                    console.log(JSON.stringify(config.store, null, 2));
                    return;
                }
                if (key && value && options.set) {
                    config.set("config_keys.".concat(key), value);
                    console.log("Key ".concat(key, " was set"));
                    return;
                }
                if (key && options["delete"]) {
                    config["delete"](key);
                    console.log("Key ".concat(key, " was deleted."));
                    return;
                }
                if (key) {
                    var configValue = config.get("config_keys.".concat(key));
                    if (configValue) {
                        console.log(configValue);
                    }
                    return;
                }
            });
            //   config.set("wasRun", false);
            if (!config.has("wasRun") || !config.get("wasRun")) {
                console.log("First time run");
                config.set("wasRun", true);
                config.set("prompts", {});
                config.set("prompt_list", []);
            }
            program.name("ry");
            //   program.name("rootsby");
            program.parse();
            return [2 /*return*/];
        });
    });
})();
