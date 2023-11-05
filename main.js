import {oga} from './oga_conv.js'
import {openai} from './openai.js'
import { Telegraf,Markup} from 'telegraf';
import {code} from 'telegraf/format'
import { message } from "telegraf/filters";
import {downloadImage}  from 'image.js'

const INITIAL_SESSION= {
    messages: [],
}

const bot = new Telegraf('6960345349:AAHZh3X3ddRbRudqbJvr6qDyhhch44HGz2g')

const dict_v= {}
const dict_t= {}


bot.command('start', async (ctx)=>{
    await ctx.reply(code('Жду ваш запрос'))
})

bot.on(message('text'), async ctx =>{
    const txt= await ctx.message.text
    const user_id = String(ctx.message.from.id)
    dict_t['id']=user_id
    dict_t[user_id]=String(txt)
    ctx.reply('Что вы хотите сделать?', Markup.inlineKeyboard([
        [Markup.button.callback('спросить у chatGPT', 'GPT_txt')],
       [ Markup.button.callback('сгенерировать картинку', 'pict_txt')]
    ]))
})

bot.on(message('voice'), async ctx =>{
    try {
        await ctx.reply(code('подождите'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const user_id = String(ctx.message.from.id)
        const ogaPath = await oga.create(link.href, user_id)
        const mp3Path = await oga.toMp3(ogaPath, user_id)
        const text = await openai.transcription(mp3Path)
        dict_v['id']=user_id
        dict_v[user_id]=String(text)
        await ctx.reply(code(`текст сообщения: ${text}`))

        await ctx.reply('Что вы хотите сделать?', Markup.inlineKeyboard([
            [Markup.button.callback('спросить у chatGPT', 'GPT_voice')],
            [Markup.button.callback('сгенерировать картинку', 'pict_voice')],
        ]))
    }catch (e){
        console.log('error',e)
    }
})

bot.action('GPT_voice', async (ctx)=>{
    ctx.session ??= INITIAL_SESSION
    try {
        ctx.reply(code('выполняется запрос,подождите'))
        const id = dict_v['id']
        const text = dict_v[id]
        console.log(text)
        ctx.session.messages.push({role: openai.roles.USER, content: text})
        const responce = await openai.chat( ctx.session.messages)
        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: responce
        })

        await ctx.reply(`ответ от chatGPT: ${responce}`)

    }catch (e){
        console.log('error',e)
    }
})

bot.action('GPT_txt', async (ctx)=>{
    ctx.session ??= INITIAL_SESSION
    try {
        ctx.reply(code('выполняется запрос,подождите'))
        const id = dict_t['id']
        const text = dict_t[id]
        ctx.session.messages.push({role: openai.roles.USER, content: text})
        const responce = await openai.chat(ctx.session.messages)
        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: responce
        })

        await ctx.reply(`ответ от chatGPT: ${responce}`)

    }catch (e){
        console.log('error',e)
    }
})

bot.action('pict_txt', async (ctx)=>{
    try {
        ctx.reply(code('генерация картинки...'))
        const id = dict_t['id']
        const text = dict_t[id]
        const url = await openai.dalle(text)
        const image_path = await downloadImage(url, id)
    }catch (e) {
        console.log('error while sending img',e)
    }

})

bot.launch()

process.once('SIGINT',() => bot.stop('SIGINT'));
process.once('SIGTERM',() => bot.stop('SIGTERM'))