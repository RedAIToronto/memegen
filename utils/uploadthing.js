import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton();
export const UploadDropzone = generateUploadDropzone();

// Add error handlers
UploadButton.displayName = 'UploadButton';
UploadDropzone.displayName = 'UploadDropzone';

export const uploadConfig = {
  onUploadError: (error) => {
    console.error('Upload error:', error);
  },
  onClientUploadComplete: (res) => {
    console.log('Upload completed:', res);
  },
};
