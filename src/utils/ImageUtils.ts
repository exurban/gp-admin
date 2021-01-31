import Resizer from "react-image-file-resizer";

/**
 * Convert a dataUrl to a Blob so we can make a file to name and upload.
 */
export const dataUrlToBlob = (dataUrl: string): Blob | null => {
  if (!dataUrl) {
    console.error(`dataURLtoBlob called without providing a dataUrl argument.`);
    return null;
  }

  const arr = dataUrl.split(",");

  if (!arr) {
    console.error(`Failed to parse dataUrl: ${dataUrl}`);
  }

  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Convert Blob to a file
 * @param blob image blob to convert
 * @param filename name for the file returned
 *
 * @return file: File
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  console.log(`blobToFile is given filename of ${filename}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b: any = blob;
  b.lastModifiedDate = new Date();
  b.name = filename;
  return <File>blob;
};

/**
 * Convert a dataUrl to a File.
 */
export const dataURLtoFile = (dataUrl: string, filename: string): File | null => {
  if (!dataUrl) {
    console.error(`dataURLtoBlob called without providing a dataUrl argument.`);
    return null;
  }

  const arr = dataUrl.split(",");

  if (!arr) {
    console.error(`Failed to parse dataUrl: ${dataUrl}`);
  }

  const mime = arr[0].match(/:(.*?);/)?.[1];
  const mimetype = mime?.split("/")?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  filename = `${filename}.${mimetype}`;
  console.log(`filename: ${filename}`);
  console.log(`mimetype: ${mimetype}`);
  return new File([u8arr], filename, { type: mime });
};

/**
 * https://github.com/onurzorluer/react-image-file-resizer#readme
 * @param file image file or blob to resize
 * @param width final width of reduced image
 * @param height final height of reduced image
 * @param format image format for the reduced image. Default is .webp
 * @param quality quality for output -- 0-100, Default is 75.
 * Returns a Base64 string with the given parameters.
 */
// @ts-ignore
// eslint-disable-next-line
export const resizeFileToBase64 = (
  file: File,
  width: number,
  height: number,
  format = "WEBP",
  quality = 75
): Promise<string> =>
  new Promise(resolve => {
    Resizer.imageFileResizer(
      file,
      width,
      height,
      format,
      quality,
      0,
      uri => {
        // @ts-ignore
        resolve(uri);
      },
      "base64"
    );
  });

/**
 * https://github.com/onurzorluer/react-image-file-resizer#readme
 * @param file image file or blob to resize
 * @param width final width of reduced image
 * @param height final height of reduced image
 * @param format image format for the reduced image. Default is .webp
 * @param quality quality for output -- 0-100, Default is 75.
 * Returns a Blob with the given parameters.
 */

export const resizeFileToBlob = (
  file: Blob,
  width: number,
  height: number,
  format = "WEBP",
  quality = 75
): Promise<Blob> =>
  new Promise(resolve => {
    Resizer.imageFileResizer(
      file,
      width,
      height,
      format,
      quality,
      0,
      uri => {
        // @ts-ignore
        resolve(uri);
      },
      "blob"
    );
  });

/**
 * https://github.com/onurzorluer/react-image-file-resizer#readme
 * @param blob image file or blob to resize
 * @param width final width of reduced image
 * @param height final height of reduced image
 * @param format image format for the reduced image. Default is .webp
 * @param quality quality for output -- 0-100, Default is 75.
 * Returns a Blob with the given parameters.
 */

export const resizeBlob = (
  blob: Blob,
  width: number,
  height: number,
  format = "WEBP",
  quality = 75
): Promise<Blob> =>
  new Promise(resolve => {
    Resizer.imageFileResizer(
      blob,
      width,
      height,
      format,
      quality,
      0,
      uri => {
        // @ts-ignore
        resolve(uri);
      },
      "blob"
    );
  });
