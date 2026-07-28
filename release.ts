import { lte } from 'semver';
import { ProductTarget } from './config';
import { getProjectInfo, updateProject, uploadProject } from './request';

interface ReleaseInfo {
    readonly id: string;
    readonly name: string;
    readonly target: ProductTarget;
}

export async function releaseProject(version: string, zip: string, info: ReleaseInfo) {
    console.log(`准备发布${info.name}工程: ${info.id}`);

    const oldInfo = await getProjectInfo(info.id, info.target);
    if (lte(version, oldInfo.version)) {
        throw Error('发布版本号必须大于当前版本号');
    }

    const uploadKey = await uploadProject(zip, oldInfo, info.target);
    await updateProject(oldInfo, version, uploadKey, info.target);

    const newInfo = await getProjectInfo(info.id, info.target);
    console.log(
        `发布工程${info.name}(${info.id})成功:`,
        `${newInfo.name}(${info.id})`,
        `${oldInfo.version} -> ${newInfo.version}`,
    );
}
