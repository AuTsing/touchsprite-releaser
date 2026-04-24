export enum TsFileRoot {
    lua = 'lua',
    res = 'res',
}

export interface TsFile {
    url: string;
    root: TsFileRoot;
    path: string;
    filename: string;
}
