import { loadLuaconfig, toReleaseInfos } from './config';
import { getProjectPath } from './env';
import { releaseProject } from './release';
import { pack } from './zip';

(async () => {
    const root = getProjectPath();
    const zip = await pack(root);
    const luaconfig = await loadLuaconfig(root);
    const releaseInfos = toReleaseInfos(luaconfig);
    for (const it of releaseInfos) {
        try {
            await releaseProject(luaconfig.VERSION ?? '', zip, it);
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            } else {
                console.error(e);
            }
        }
    }
})();
