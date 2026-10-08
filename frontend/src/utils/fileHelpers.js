// src/utils/fileHelper.js
import { Icons } from '../utils/icons';

export const getFileIcon = (nombreArchivo) => {
  if (!nombreArchivo) return Icons.FileText;

  const extension = nombreArchivo.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return Icons.FileInput;
    case 'doc':
    case 'docx':
      return Icons.FileText;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return Icons.FileSpreadsheet;
    case 'ppt':
    case 'pptx':
      return Icons.Presentation;
    case 'mp4':
    case 'mov':
    case 'avi':
      return Icons.FileVideo;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return Icons.Image;
    default:
      return Icons.File;
  }
};
