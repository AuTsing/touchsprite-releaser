export enum Configurations {
    Cookie = 'cookie',
    AccessKey = 'accessKey',
    SnapOrient = 'snapOrient',
    SnapDir = 'snapDir',
    IncludeWhenSend = 'includeWhenSend',
    ExcludeWhenSend = 'excludeWhenSend',
    IncludeWhenZip = 'includeWhenZip',
    ExcludeWhenZip = 'excludeWhenZip',
    IsIosPersonal = 'isIosPersonal',
}

export default class Storage {
    getStringConfiguration(key: Configurations): string {
        switch (key) {
            case Configurations.Cookie:
                return Deno.env.get('COOKIE') ?? '';
            case Configurations.AccessKey:
                return Deno.env.get('ACCESS_KEY') ?? '';
            case Configurations.SnapOrient:
                return '';
            case Configurations.SnapDir:
                return '';
        }
        throw Error('未定义的设置项');
    }

    getStringArrayConfiguration(key: Configurations): string[] {
        switch (key) {
            case Configurations.IncludeWhenSend:
                return [];
            case Configurations.ExcludeWhenSend:
                return [];
            case Configurations.IncludeWhenZip: {
                const filesStr = Deno.env.get('INCLUDE_WHEN_ZIP');
                const files = [];
                if (filesStr !== undefined && filesStr !== '') {
                    files.push(...filesStr.split(','));
                }
                return files;
            }
            case Configurations.ExcludeWhenZip: {
                const filesStr = Deno.env.get('EXCLUDE_WHEN_ZIP');
                const files = [];
                if (filesStr !== undefined && filesStr !== '') {
                    files.push(...filesStr.split(','));
                }
                return files;
            }
        }
        throw Error('未定义的设置项');
    }

    getBooleanConfiguration(key: Configurations): boolean {
        switch (key) {
            case Configurations.IsIosPersonal:
                return false;
        }
        throw Error('未定义的设置项');
    }
}
