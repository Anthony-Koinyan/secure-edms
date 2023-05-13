export function formatFilePath(path: string, filename: string): string {
  let formattedPath = '';
  if (path === '/') {
    formattedPath = filename;
  } else if (path.startsWith('/')) {
    formattedPath = path.substring(1).replaceAll('-', ' ') + '/' + filename;
  } else {
    formattedPath = path.replaceAll('-', ' ') + '/' + filename;
  }
  return formattedPath;
}
