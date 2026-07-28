export function getLoginCookie(): string {
    return process.env.COOKIE ?? '';
}

export function getProjectPath(): string {
    return process.env.PROJECT_PATH ?? '';
}
