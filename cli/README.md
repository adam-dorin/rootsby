# Rootsby cli

Ry is a command-line interface tool that allows you to save prompts and execute them using the OpenAI API.

## Installation

To install the Ry CLI package, you need to have Node.js and npm installed on your system. After that, you can install the package using the following command:

```bash
npm install -g rootsby-cli
```
Usage:

Once you have installed the package, you can use the following command to view the available commands:

```bash
# you can use rootsby or ry to access the package
ry --help
```

This will display a list of available commands along with a brief description of their usage.

## Prompt Management

The prompt command allows you to manage your prompts. You can use the following options with the prompt command:

```bash
ry prompt my_prompt_name "The text of the prompt"
# Usage: ry prompt [options] [name] [text...]
# Options:
#   -l, --list    List all prompts
#   -s, --set     Set a prompt
#   -d, --delete  Delete a prompt
#   -h, --help    Display help for command
```
## List Prompts

To list all the prompts you have saved, use the -l or --list option with the prompt command:

```bash
ry prompt --list
```
This will display a list of all the prompts you have saved along with their names and texts.

## Set a Prompt

To set a prompt, use the `-s` or `--set` option with the prompt command:

```bash
ry prompt --set "Prompt Name" "Prompt Text"
```
Replace "Prompt Name" with the name of the prompt you want to save and "Prompt Text" with the text you want to use for the prompt.

## Delete a Prompt

To delete a prompt, use the `-d` or `--delete` option with the prompt command:

```bash
ry prompt --delete "prompt_name"
```

Replace "Prompt Name" with the name of the prompt you want to delete.

## Execute a Prompt

The ask command allows you to execute a prompt using the text. You can use the following options with the ask command:

```bash
# Usage: ry ask [options] [text...]

# Options:
#   -e, --exec [prompt_name]  Name of the prompt to execute
#   --api_key [key_value]     Value of the api key
#   -h, --help                Display help for command
```
To execute a prompt, use the `-e` or `--exec` option with the ask command:

```bash
ry ask --exec "Prompt Name" "Text to use for the prompt"
```

Replace "Prompt Name" with the name of the prompt you want to execute and "Text to use for the prompt" with the text you want to use for the prompt.

### API Key

To use the OpenAI API, you need to provide an API key. You can do this by using the --api_key option with the ask command:

```bash
ry ask "Text to use for the prompt" --api_key "$YOUR_API_KEY" 
```
Replace `YOUR_API_KEY` with your actual OpenAI API key.

## Configuration

The config command allows you to access and modify the configuration of the Ry CLI package. You can use the following options with the config command:

```bash
# Usage: ry config [options] [key] [value]

# Options:
#   -s, --set     Paired key value to set in the config
#   -d, --delete  Key to delete from the config
# --full Output the full config
# -h, --help Display help for command
```
#### Set a Configuration Key

To set a configuration key, use the `-s` or `--set` option with the `config` command:
```bash
ry config --set "this_is_my_key" "Config Value"
```
Replace `"Config Key"` with the name of the configuration key you want to set and `"Config Value"` with the value you want to set.

#### Delete a Configuration Key

To delete a configuration key, use the `-d` or `--delete` option with the `config` command:

```bash
ry config --delete "Config Key"
```
Replace `"Config Key"` with the name of the configuration key you want to delete.

#### Output the Full Configuration

To output the full configuration, use the `--full` option with the `config` command:
```bash
ry config --full
```
This will display the full configuration of the Ry CLI package.

## Help
To get help on a specific command, use the `--help` command followed by the command you want to get help for:

```bash
# General help
ry --help
# Help with the prompt command
ry prompt --help
# Help with the ask command
ry ask --help
# Help with the config command
ry config --help
```