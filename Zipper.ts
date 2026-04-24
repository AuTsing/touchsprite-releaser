import * as FsPromises from 'node:fs/promises';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import Jszip from 'jszip';
import { TsFile } from './Device.ts';
import Projector, { ProjectMode } from './Projector.ts';
import Output from './Output.ts';
import Storage from './Storage.ts';

export default class Zipper extends Jszip {
    private readonly storage: Storage;

    constructor(storage: Storage) {
        super();
        this.storage = storage;
    }

    private async addFiles(files: TsFile[]): Promise<void> {
        for (const file of files) {
            const data = await FsPromises.readFile(file.url);
            const relativePath = file.path.substring(1);
            const path = Path.join(relativePath, file.filename).replace(/\\/g, '/');
            this.file(path, data);
        }
    }

    private async zip(dir: string, filename: string): Promise<string> {
        const url = await new Promise<string>((resolve, reject) => {
            const url = Path.join(dir, filename);
            this.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(Fs.createWriteStream(url))
                .on('finish', () => resolve(url))
                .on('error', e => reject(e));
        });
        return url;
    }

    public async handleZipProject(): Promise<string> {
        try {
            const projector = new Projector(this.storage, undefined, ProjectMode.zip);
            const tsFiles = await projector.generate();
            await this.addFiles(tsFiles);
            const root = await projector.locateRoot();
            const dir = Path.dirname(root);
            const filename = Path.basename(root) + '.zip';
            const url = await this.zip(dir, filename);

            Output.println('打包工程成功:', url);
            return url;
        } catch (e) {
            Output.eprintln('打包工程失败:', (e as Error).message ?? e);
            return '';
        }
    }
}
