const  chatGPT  = require("./scripts/openai");

async function ask(prompt, text, openAiKey){
    console.log("ask was called. Ask is not implemented yet.");
    console.log("prompt: ", prompt);
    console.log("text: ", text);

    const config = {
        apiKey: openAiKey,
        system: prompt
    };
    const previousMessages = [];

    await chatGPT(config, text, previousMessages)
}


exports = module.exports = ask;