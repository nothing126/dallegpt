import axios from "axios";
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import {dirname,resolve} from 'path';
import {fileURLToPath} from 'url';
import {remove_file} from "./remove.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
class OgaConverter{
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }
    toMp3(input,output){
        try
        {
            const outputPath= resolve(dirname(input), `${output}.mp3`)
            return  new Promise((resolve, ) =>{
                ffmpeg(input)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end',async () => {
                        await remove_file(input)
                        await resolve(outputPath)
                    })
                    .on('error', err => console.log(err.message))
                    .run()
            })
        }
        catch (e)
        {
            console.log('Error while creating mp3 ', e.message)
        }
    }

    async create(url, filename){
        try {
            const ogaPath = resolve(__dirname, 'C:\\Users\\ajiga\\WebstormProjects\\untitled2\\voices', `${filename}.oga`)
            const response= await axios({
                method: 'get',
                url,
                responseType: 'stream'
            })
            return new Promise(resolve =>{
                const stream = createWriteStream(ogaPath)
                response.data.pipe(stream)
                stream.on('finish',() => resolve(ogaPath))
            })

        }
        catch (e)
        {
            console.log("error while creating oga",e)
        }
    }
}

export const oga = new OgaConverter()