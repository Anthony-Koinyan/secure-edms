import {
  IconDefinition,
  faFile,
  faFileCsv,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFilePowerpoint,
  faFileWord,
  faFileZipper,
  faFolder,
  faHeadphones,
  faImage,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import getFileType, { MimeType } from './getFileType';

export const IconDetector = ({ mimeType }: { mimeType: MimeType }) => {
  let fileType = getFileType(mimeType);
  let icon: IconDefinition;

  switch (fileType) {
    case 'Document':
      icon = faFileWord;
      break;

    case 'PDF':
      icon = faFilePdf;
      break;

    case 'Text file':
      icon = faFileLines;
      break;

    case 'Spreadsheet':
      icon = faFileExcel;
      break;

    case 'CSV file':
      icon = faFileCsv;
      break;

    case 'Presentation':
      icon = faFilePowerpoint;
      break;

    case 'Audio':
      icon = faHeadphones;
      break;

    case 'Video':
      icon = faVideo;
      break;

    case 'Image':
      icon = faImage;
      break;

    case 'Archive file':
      icon = faFileZipper;
      break;

    default:
      icon = !mimeType ? faFolder : faFile;
      break;
  }

  return <FontAwesomeIcon icon={icon} className="m-auto" />;
};
