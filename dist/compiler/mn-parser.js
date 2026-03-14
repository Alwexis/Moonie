export function parseMnFile(content) {
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    return {
        script: scriptMatch?.[1].trim() ?? "",
        template: templateMatch?.[1].trim() ?? "",
    };
}
