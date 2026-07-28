import { ProductTarget } from './config';

const TS_NS = 'touchsprite-extension';
const TS_LOGIN_URL = 'https://account.touchsprite.com/';
const TS_INFO_URL = 'https://dev.touchsprite.com/touch/script/view';
const TS_ENT_INFO_URL = 'https://ent.touchsprite.com/touch/scripts/view';
const TS_APP_INFO_URL = 'https://app.touchsprite.com/touch/script/view';
const TS_UPLOAD_URL = 'https://dev.touchsprite.com/touch/script/upload';
const TS_ENT_UPLOAD_URL = 'https://ent.touchsprite.com/touch/scripts/upload';
const TS_APP_UPLOAD_URL = 'https://app.touchsprite.com/touch/upload/script';
const TS_UPDATE_URL = 'https://dev.touchsprite.com/touch/script/version';
const TS_ENT_UPDATE_URL = 'https://ent.touchsprite.com/touch/scripts/commit-version';
const TS_APP_UPDATE_URL = 'https://app.touchsprite.com/touch/script/upgrade';
const TS_OPENAPI_URL = 'http://openapi.touchsprite.com/api/openapi';

export function getLoginUrl(): string {
    return TS_LOGIN_URL;
}

export function getProjectInfoUrl(target: ProductTarget): string {
    switch (target) {
        case ProductTarget.Ts:
            return TS_INFO_URL;
        case ProductTarget.Ent:
            return TS_ENT_INFO_URL;
        case ProductTarget.App:
            return TS_APP_INFO_URL;
        case ProductTarget.AppTs:
            return TS_APP_INFO_URL;
    }
}

export function getUploadProjectUrl(target: ProductTarget): string {
    switch (target) {
        case ProductTarget.Ts:
            return TS_UPLOAD_URL;
        case ProductTarget.Ent:
            return TS_ENT_UPLOAD_URL;
        case ProductTarget.App:
            return TS_APP_UPLOAD_URL;
        case ProductTarget.AppTs:
            return TS_APP_UPLOAD_URL;
    }
}

export function getUpdateProjectUrl(target: ProductTarget): string {
    switch (target) {
        case ProductTarget.Ts:
            return TS_UPDATE_URL;
        case ProductTarget.Ent:
            return TS_ENT_UPDATE_URL;
        case ProductTarget.App:
            return TS_APP_UPDATE_URL;
        case ProductTarget.AppTs:
            return TS_APP_UPDATE_URL;
    }
}
