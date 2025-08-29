export default interface MediaData {
  id: string;
  s3Key: string;
  fileName: string;
  createdAt: Date;
  fileSize: number;
  mimeType: string;
  url: string;
}
