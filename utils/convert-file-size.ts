export function convertFileSize(sizeInBytes?: number): string {
  if (!sizeInBytes) {
    return '';
  }

  const sizeInKB = sizeInBytes / 1024;
  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`;
  }

  const sizeInMB = sizeInKB / 1024;
  return `${sizeInMB.toFixed(2)} MB`;
}
