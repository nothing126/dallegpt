import OpenAIApi from "openai";
import Configuration from "openai";
import {createReadStream} from 'fs'
class openAI{
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,

        });
        this.openai = new OpenAIApi(configuration)
    }
    async chat(messages) {
        try
        {
            const response= await this.openai.chat.completions.create({
                model:'gpt-3.5-turbo',
                messages
            })
            return response.choices[0].message.content
        }
        catch (e)
        {
            console.log('error while gpt chat', e)
        }
    }

    async transcription(filepath) {
        try {
            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1'
            })
            return response.text
        }
        catch (e)
        {
            console.log('error while transcription', e.message)
        }
    }
    async dalle(promt){
        const response = await this.openai.images.generate({
            prompt:String(promt),
            n: 1,
            size: "1024x1024"
        })
        return response.data[0].url
    }

}



export const openai = new openAI('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')