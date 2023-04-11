#! /usr/bin/env node

import { Conf } from "conf";

const captureStdin = (q: string):Promise<string> => {
  return new Promise((resolve, reject) => {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function query(question) {
      rl.question(question, (answer) => {
        if (answer === "-e") {
          process.exit(1);
        }
        resolve(answer as string);
        rl.close();
      });
    }

    query(`\n${q}\ntype -e to quit\n\n❯❯❯ `);
  });
};

(async function () {
  const { program } = require("commander");
  const pkg = require("./package.json");
//   const Conf = await import("conf");
  const config = new Conf.default({ projectName: "rootsby-cli" });

  program.version(pkg.version);

  program
    .command("prompt")
    .argument("[name]", "Name of the prompt", "")
    .argument("[text...]", "Text to use for the prompt", "")
    .description("Prompt management")
    .option("-l, --list", "List all prompts")
    .option("-s, --set", "Set a prompt")
    .option("-d, --delete", "Delete a prompt")
    .action(async function (name, text, options) {
      //   console.log("Prompt name: " + name);
      //   console.log("Text: " + JSON.stringify(text));
      //   console.log("Options: " + JSON.stringify(options));
      if (options.list) {
        const prompt_list = config.get("prompt_list") || [];
        if (prompt_list.length === 0) {
          console.log("No prompts. Create one first. using -s or --set");
          return;
        }
        prompt_list.map((promptName, index) => {
          console.log(`${index + 1}. ${promptName}`);
        });
        return;
      }
      if (name && options.set) {
        let fromStdin = false;
        if (!text) {
          text = await captureStdin("What is the text for the prompt?");
          fromStdin = true;
        }
        const prompt_list = config.get("prompt_list") || [];
        if (prompt_list.indexOf(name) === -1) {
          prompt_list.push(name);
          config.set("prompt_list", prompt_list);
        }
        config.set(`prompts.${name}`, fromStdin ? text : text.join(" "));
        return;
      }

      if (name && options.delete) {
        const prompt_list = config.get("prompt_list") || [];
        const index = prompt_list.indexOf(name);
        if (index > -1) {
          prompt_list.splice(index, 1);
          config.set("prompt_list", prompt_list);
          config.delete(`prompts.${name}`);
          console.log(`Prompt ${name} was deleted.`);
        } else {
          console.log(`Prompt ${name} does not exist.`);
        }
      }
      if (name && !options.set && !options.set) {
        const prompt = config.get(`prompts.${name}`);
        console.log(prompt);
        return;
      }
    });

  program
    .command("ask")
    .argument("[text...]", "Text to use for the prompt", "")
    .description("Execute a prompt using the text")
    .option("-e, --exec [prompt_name]", "Name of the prompt to execute")
    .option("--api_key [key_value]", "Value of the api key")
    .action(async function (text, options) {
      // get the text and the options
      // if there is no get it from stdin
      if (!text) {
        text = await captureStdin("What is the text for the prompt?");
      } else {
        text = text.join(" ").trim();
      }
      // if options.exec is set, and the prompt exists then execute the prompt using the text
      if (text && options.exec && typeof options.exec === "string") {
        const prompt = config.get(`prompts.${options.exec}`);
        if (prompt) {
          console.log(prompt);
        }
      }
      // if options.exec is not set, then prompt the user to select a prompt to execute
      if (text && !options.exec) {
        const prompt_list = config.get("prompt_list") || [];
        const openAiKey =
          options.api_key || config.get("config_keys.open_ai_api_key");
        if (!openAiKey) {
          console.log(
            "No OpenAI API key. Set one firs, or pass it as an option using --api_key "
          );
          let example = `Example: \n `;
          example += `ry ask "Hello world" --api_key "sk-1234567890abcdefg"\nor\n`;
          example += `ry config set open_ai_api_key "sk-1234567890abcdefg"\nry ask "Hello world"`;
          console.log(example);
          return;
        }
        if (prompt_list.length === 0) {
          console.log("No prompts. Create one first. ");
          return;
        }
        if (prompt_list.length === 1) {
          console.log("Only one prompt");
          const prompt = config.get(`prompts.${prompt_list[0]}`);
          const ask = require("./commands/ask");

          // execute the prompt
          return await ask(prompt, text, openAiKey);
        }
        if (prompt_list.length > 1) {
          // go with the simplest option show a numbered list of prompts and ask the user to select one
          prompt_list.map((promptName, index) => {
            console.log(`${index + 1}. ${promptName}`);
          });
          let promptIndex: string | number = await captureStdin(
            "Which prompt do you want to execute? (number)"
          );
          promptIndex = parseInt(promptIndex as string);
          if (
            !Number.isNaN(promptIndex) &&
            promptIndex > 0 &&
            promptIndex <= prompt_list.length
          ) {
            const prompt = config.get(
              `prompts.${prompt_list[promptIndex - 1]}`
            );
            if (prompt) {
              // execute the prompt
              const ask = require("./commands/ask");
              await ask(prompt, text, openAiKey);
            }
          }
          return;
        }
      }
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
        config.set(`config_keys.${key}`, value);
        console.log(`Key ${key} was set`);
        return;
      }
      if (key && options.delete) {
        config.delete(key);
        console.log(`Key ${key} was deleted.`);
        return;
      }
      if (key) {
        const configValue = config.get(`config_keys.${key}`);
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
})();
