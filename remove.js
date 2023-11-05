import {unlink} from 'fs/promises';
export async function remove_file(path){
    try {
        await unlink(path);
    }
    catch (e)
    {
        console.log('error while removing file', e);
    }
}