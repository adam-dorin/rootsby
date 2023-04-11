async function chatGPT(config, text, messages = []) {
  try {
    const openai = require("openai");
    const openAiConfig = new openai.Configuration({
      apiKey: config.apiKey,
    });
    const openaiApi = new openai.OpenAIApi(openAiConfig);
    const completion = await openaiApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      max_tokens: 250,
      messages: [
        { role: "system", content: config.system },
        ...messages,
        { role: "user", content: text },
      ],
    });

    console.log("data: ", completion.data.choices[0].message.content);
  } catch (err) {
    console.log("err:", err);
  }
}

exports = module.exports = chatGPT;
