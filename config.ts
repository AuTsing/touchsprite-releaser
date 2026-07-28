import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
// @ts-ignore
import { parse } from 'luaparse';

export interface LuaconfigInfo {
    ID: string | null;
    ID_ENT: string | null;
    ID_APP: string | null;
    ID_APP_TS: string | null;
    VERSION: string | null;
}

export enum ProductTarget {
    Ts,
    Ent,
    App,
    AppTs,
}

export interface ReleaseInfo {
    readonly id: string;
    readonly name: string;
    readonly target: ProductTarget;
}

export async function loadLuaconfig(root: string): Promise<LuaconfigInfo> {
    const luaconfig: LuaconfigInfo = {
        ID: null,
        ID_ENT: null,
        ID_APP: null,
        ID_APP_TS: null,
        VERSION: null,
    };

    const files = await readdir(root);
    if (!files.includes('luaconfig.lua')) {
        return luaconfig;
    }

    const file = join(root, 'luaconfig.lua');
    const content = await readFile(file, { encoding: 'utf8' });
    const ast = parse(content);
    if (!ast) {
        return luaconfig;
    }
    if (ast.type !== 'Chunk') {
        return luaconfig;
    }

    const bodies = ast.body;
    const statement = bodies.find((body: any) => body.type === 'ReturnStatement');
    if (!statement) {
        return luaconfig;
    }

    const expression = statement.arguments?.[0];

    if (!expression) {
        return luaconfig;
    }

    let tableExpression: any | undefined;
    if (expression.type === 'TableConstructorExpression') {
        tableExpression = expression;
    }
    if (expression.type === 'IndexExpression') {
        if (expression.base?.type !== 'TableConstructorExpression') {
            return luaconfig;
        }
        if (expression.index?.type !== 'NumericLiteral') {
            return luaconfig;
        }
        const fields = expression.base.fields;
        const index = expression.index.value - 1;
        tableExpression = fields[index]?.value;
    }
    if (!tableExpression) {
        return luaconfig;
    }

    const fields = tableExpression?.fields;
    if (!fields) {
        return luaconfig;
    }

    for (const field of fields) {
        let key: string | undefined;
        if (field.type === 'TableKey') {
            key = field.key.raw.replace(/\'/g, '');
        }
        if (field.type === 'TableKeyString') {
            key = field.key.name;
        }
        key = key?.toUpperCase();
        if (!key) {
            continue;
        }

        let value: string | undefined;
        if (field.value.type === 'StringLiteral') {
            value = field.value.raw.replace(/\'/g, '');
        }
        if (field.value.type === 'NumericLiteral') {
            value = field.value.raw;
        }
        if (!value) {
            continue;
        }

        switch (key) {
            case 'ID':
                luaconfig.ID = value;
                break;
            case 'ID_ENT':
                luaconfig.ID_ENT = value;
                break;
            case 'ID_APP':
                luaconfig.ID_APP = value;
                break;
            case 'ID_APP_TS':
                luaconfig.ID_APP_TS = value;
                break;
            case 'VERSION':
                luaconfig.VERSION = value;
                break;
        }
    }

    return luaconfig;
}

export function toReleaseInfos(luaconfig: LuaconfigInfo): ReleaseInfo[] {
    const releaseInfos: ReleaseInfo[] = [];

    if (luaconfig.ID !== null) {
        const ids = luaconfig.ID.split(',');
        const infos = ids.map(it => ({ id: it, name: '', target: ProductTarget.Ts }));
        releaseInfos.push(...infos);
    }
    if (luaconfig.ID_ENT !== null) {
        const ids = luaconfig.ID_ENT.split(',');
        const infos = ids.map(it => ({ id: it, name: '企业版', target: ProductTarget.Ent }));
        releaseInfos.push(...infos);
    }
    if (luaconfig.ID_APP !== null) {
        const ids = luaconfig.ID_APP.split(',');
        const infos = ids.map(it => ({ id: it, name: '小精灵', target: ProductTarget.App }));
        releaseInfos.push(...infos);
    }
    if (luaconfig.ID_APP_TS !== null) {
        const ids = luaconfig.ID_APP_TS.split(',');
        const infos = ids.map(it => ({ id: it, name: '小精灵脚本', target: ProductTarget.AppTs }));
        releaseInfos.push(...infos);
    }

    return releaseInfos;
}
