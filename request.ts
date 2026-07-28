import { openAsBlob } from 'node:fs';
import { basename } from 'node:path';
import { stat } from 'node:fs/promises';
import { ProductTarget } from './config';
import { getLoginCookie } from './env';
import { getLoginUrl, getProjectInfoUrl, getUpdateProjectUrl, getUploadProjectUrl } from './url';

interface ScriptInfo {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly encrypt: string;
    readonly updatedAt: string;
    readonly uuid: string;
}

const defaultHeaders = {
    cookie: '',
};

async function getHeaders(): Promise<{ cookie: string }> {
    if (defaultHeaders.cookie === '') {
        const loginCookie = getLoginCookie();
        if (loginCookie === '') {
            throw Error('获取登录 Cookie 失败');
        }

        const url = getLoginUrl();
        const resp = await fetch(url, { headers: { cookie: loginCookie }, redirect: 'manual' });
        if (resp.status !== 302) {
            throw Error('登录失败');
        }

        const cookies = resp.headers.getSetCookie();
        const cookie = cookies.find(it => it.startsWith('PHPSESSID'));
        if (cookie === undefined) {
            throw new Error('获取 Cookie 失败');
        }

        defaultHeaders.cookie = cookie;
    }

    return defaultHeaders;
}

export async function getProjectInfo(id: string, target: ProductTarget): Promise<ScriptInfo> {
    const url = getProjectInfoUrl(target);
    const urlWithParams = new URL(url);
    urlWithParams.searchParams.set('id', id);
    const headers = await getHeaders();

    const resp = await fetch(urlWithParams, { method: 'GET', headers });
    if (resp.status !== 200) {
        throw new Error(`请求失败: ${resp.status}`);
    }

    const respJson = await resp.json();
    if (respJson.msg !== '查询成功') {
        throw new Error(`查询脚本状态失败: ${respJson.msg}`);
    }

    const name = respJson.data?.details?.name ?? respJson.data?.script?.name;
    if (!name) {
        throw new Error('获取脚本名失败');
    }

    const version = respJson.data?.version?.version;
    if (!version) {
        throw new Error('获取脚本版本号失败');
    }

    const encrypt = respJson.data?.version?.encrypt_mode?.replace('V', '').replace('v', '');
    if (!encrypt) {
        throw new Error('获取脚本加密模式失败');
    }

    const updatedAt =
        respJson.data?.version?.created_at ?? respJson.data?.version?.updated_at ?? respJson.data?.version?.update_at;
    if (!updatedAt) {
        throw new Error('获取脚本更新日期失败');
    }

    const uuid = respJson.data?.details?.uuid ?? '';

    return { id, name, version, encrypt, updatedAt, uuid };
}

function genUploadProjectPayload(
    target: ProductTarget,
    info: ScriptInfo,
    file: Blob,
    filename: string,
    size: number,
): FormData {
    const formData = new FormData();

    switch (target) {
        case ProductTarget.Ts:
            formData.append('ScriptUpload[file]', file, filename);
            break;
        case ProductTarget.Ent:
            formData.append('file', file, filename);
            formData.append('script_id', info.id);
            break;
        case ProductTarget.App:
            formData.append('qqfile', file, filename);
            formData.append('qquuid', info.uuid);
            formData.append('qqfilename', filename);
            formData.append('qqtotalfilesize', size.toString());
            break;
        case ProductTarget.AppTs:
            formData.append('qqfile', file, filename);
            formData.append('qquuid', info.uuid);
            formData.append('qqfilename', filename);
            formData.append('qqtotalfilesize', size.toString());
            break;
    }

    return formData;
}

export async function uploadProject(zip: string, info: ScriptInfo, target: ProductTarget): Promise<string> {
    const file = await openAsBlob(zip, { type: 'application/zip' });
    const filename = basename(zip);
    const stats = await stat(zip);
    const size = stats.size;
    const url = getUploadProjectUrl(target);
    const headers = await getHeaders();
    const formData = genUploadProjectPayload(target, info, file, filename, size);

    const resp = await fetch(url, { method: 'POST', headers, body: formData });
    if (resp.status !== 200) {
        throw new Error(`请求失败: ${resp.status}`);
    }

    const respJson = await resp.json();
    if (respJson.msg !== '上传成功' && respJson.msg !== '查询成功') {
        throw new Error(`上传失败: ${respJson.msg}`);
    }

    const uploadKey = respJson.data?.key;
    if (!uploadKey) {
        throw new Error('获取上传密钥失败');
    }

    return uploadKey;
}

function genUpdateProjectPayload(
    target: ProductTarget,
    info: ScriptInfo,
    version: string,
    changelog: string,
    uploadKey: string,
): FormData {
    const formData = new FormData();

    switch (target) {
        case ProductTarget.Ts:
            formData.append('key', uploadKey);
            formData.append('script_id', info.id);
            formData.append('version', version);
            formData.append('is_default', 'true');
            formData.append('encrypt_mode', info.encrypt);
            formData.append('updated_logs', changelog);
            break;
        case ProductTarget.Ent:
            formData.append('key', uploadKey);
            formData.append('script_id', info.id);
            formData.append('version', version);
            formData.append('default', '1');
            formData.append('encrypt_mode', info.encrypt);
            formData.append('updated_logs', changelog);
            break;
        case ProductTarget.App:
            formData.append('md5', uploadKey);
            formData.append('script_id', info.id);
            formData.append('version', version);
            formData.append('encrypt_mode', info.encrypt);
            formData.append('upload_log', changelog);
            formData.append('package_name', '0');
            formData.append('type', '2');
            break;
        case ProductTarget.AppTs:
            formData.append('md5', uploadKey);
            formData.append('script_id', info.id);
            formData.append('version', version);
            formData.append('encrypt_mode', info.encrypt);
            formData.append('upload_log', changelog);
            formData.append('package_name', '0');
            formData.append('type', '1');
            break;
    }

    return formData;
}

export async function updateProject(info: ScriptInfo, version: string, uploadKey: string, target: ProductTarget) {
    const url = getUpdateProjectUrl(target);
    const formData = genUpdateProjectPayload(target, info, version, version, uploadKey);
    const headers = await getHeaders();

    const resp = await fetch(url, { method: 'POST', headers, body: formData });
    if (resp.status !== 200) {
        throw new Error(`请求失败: ${resp.status}`);
    }

    const respJson = await resp.json();
    if (respJson.msg !== '版本上传成功' && respJson.msg !== '上传成功') {
        throw new Error(`更新版本失败: ${respJson.msg}`);
    }
}
