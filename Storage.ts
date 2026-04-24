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
    getConfiguration(): {
        get<T>(key: string): T | undefined;
    } {
        return {
            get<T>(key: string): T | undefined {
                switch (key) {
                    case Configurations.Cookie:
                        return Deno.env.get('COOKIE') as T;
                    case Configurations.AccessKey:
                        return Deno.env.get('ACCESS_KEY') as T;
                    case Configurations.IncludeWhenZip:
                        return JSON.parse(Deno.env.get('INCLUDE_WHEN_ZIP') ?? '') as T;
                    case Configurations.ExcludeWhenZip:
                        return JSON.parse(Deno.env.get('EXCLUDE_WHEN_ZIP') ?? '') as T;
                }
            },
        };
    }

    getStringConfiguration(key: Configurations): string {
        const configuration = this.getConfiguration();
        switch (key) {
            case Configurations.Cookie:
                return configuration.get<string>(Configurations.Cookie) ?? '';
            case Configurations.AccessKey:
                return configuration.get<string>(Configurations.AccessKey) ?? '';
            case Configurations.SnapOrient:
                return configuration.get<string>(Configurations.SnapOrient) ?? '';
            case Configurations.SnapDir:
                return configuration.get<string>(Configurations.SnapDir) ?? '';
        }
        throw Error('未定义的设置项');
    }

    getStringArrayConfiguration(key: Configurations): string[] {
        const configuration = this.getConfiguration();
        switch (key) {
            case Configurations.IncludeWhenSend:
                return configuration.get<string[]>(Configurations.IncludeWhenSend) ?? [];
            case Configurations.ExcludeWhenSend:
                return configuration.get<string[]>(Configurations.ExcludeWhenSend) ?? [];
            case Configurations.IncludeWhenZip:
                return configuration.get<string[]>(Configurations.IncludeWhenZip) ?? [];
            case Configurations.ExcludeWhenZip:
                return configuration.get<string[]>(Configurations.ExcludeWhenZip) ?? [];
        }
        throw Error('未定义的设置项');
    }

    getBooleanConfiguration(key: Configurations): boolean {
        const configuration = this.getConfiguration();
        switch (key) {
            case Configurations.IsIosPersonal:
                return configuration.get<boolean>(Configurations.IsIosPersonal) ?? false;
        }
        throw Error('未定义的设置项');
    }
}
