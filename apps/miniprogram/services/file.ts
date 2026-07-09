import { uploadFile } from '../utils/request';

export function uploadImage(filePath: string) {
  return uploadFile(filePath);
}
