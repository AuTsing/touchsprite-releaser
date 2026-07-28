import { zip } from 'zip-a-folder';

export async function pack(root: string): Promise<string> {
    const file = 'out.zip';
    await zip(root, file, { exclude: ['.*'] });

    return file;
}
