async function chatGPT(config, messages) {
  // config: { apiKey: string, system: string, chatConfig: object }, messages: array
  try {
    console.log("config------: ", messages);
    console.log("config------>: ", config);
    const openai = require("openai");
    const openAiConfig = new openai.Configuration({
      apiKey: config.apiKey,
    });
    const openaiApi = new openai.OpenAIApi(openAiConfig);
    const chatCompletionConfig = {
      model: "gpt-3.5-turbo",
      max_tokens: 250,
    //   stream: true,
      ...config.chatConfig,
      messages
    };
    const completion = await openaiApi.createChatCompletion(
      chatCompletionConfig
    );

    // console.log("data: ", completion.data.choices[0].message.content);
     return completion.data.choices[0].message.content;   
} catch (err) {
    console.log("err:", err.response.data);
    return null;
  }
}

exports = module.exports = chatGPT;
