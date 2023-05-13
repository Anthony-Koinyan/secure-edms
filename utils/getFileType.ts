export type MimeType =
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/pdf'
  | 'text/plain'
  | 'application/rtf'
  | 'application/vnd.oasis.opendocument.text'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/csv'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/vnd.oasis.opendocument.presentation'
  | 'application/zip'
  | 'application/x-rar-compressed'
  | 'application/x-7z-compressed'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'audio/aac'
  | 'audio/flac'
  | 'audio/mp4'
  | 'video/mp4'
  | 'video/avi'
  | 'video/x-matroska'
  | 'video/quicktime'
  | 'video/webm'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/bmp'
  | 'image/svg+xml';

type FileType =
  | 'Document'
  | 'PDF'
  | 'Text file'
  | 'Spreadsheet'
  | 'CSV file'
  | 'Presentation'
  | 'Archive file'
  | 'Audio'
  | 'Video'
  | 'Image'
  | 'Unknown';

export default (mimeType: MimeType): FileType => {
  switch (mimeType) {
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Document';

    case 'application/pdf':
      return 'PDF';

    case 'text/plain':
    case 'application/rtf':
    case 'application/vnd.oasis.opendocument.text':
      return 'Text file';

    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Spreadsheet';

    case 'text/csv':
      return 'CSV file';

    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.oasis.opendocument.presentation':
      return 'Presentation';

    case 'application/zip':
    case 'application/x-rar-compressed':
    case 'application/x-7z-compressed':
      return 'Archive file';

    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/aac':
    case 'audio/flac':
    case 'audio/mp4':
      return 'Audio';

    case 'video/mp4':
    case 'video/avi':
    case 'video/x-matroska':
    case 'video/quicktime':
    case 'video/webm':
      return 'Video';

    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
    case 'image/bmp':
    case 'image/svg+xml':
      return 'Image';

    default:
      return 'Unknown';
  }
};
