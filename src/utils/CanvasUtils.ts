type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Creates a new Image object from a URL
 * @param {URL} imageUrl - url for the image to be loaded
 * @return {Promise<HTMLImageElement>} image - Promise of a hydrated image object representing an HTML <img> element which is not attached to any DOM tree.
 */
export const loadImageAtUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", error => reject(error));
    image.src = url;
  });

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {string} imageUrl - url for the image to be loaded, cropped and rotated
 * @param {Area} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 *
 * @return {string} blobUrl - a DOMString URL in the form of blob:http:...
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> => {
  const result = await loadImageAtUrl(imageSrc);

  let image = new Image();

  if (!result) {
    return null;
  }

  image = result;

  console.log(
    `hydrated image from URL -- height: ${image.naturalHeight} width: ${image.naturalWidth}`
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!image || !ctx) {
    console.error(`failed to load image or create context.`);
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Returns a DOMString containing a URL representing the cropped image
  return new Promise(resolve => {
    canvas.toBlob(file => {
      resolve(URL.createObjectURL(file));
    }, "image/jpeg");
  });
};

export async function getRotatedImage(imageSrc: string, rotation = 0): Promise<string | null> {
  const image = await loadImageAtUrl(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const orientationChanged =
    rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270;
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return new Promise(resolve => {
    canvas.toBlob(file => {
      resolve(URL.createObjectURL(file));
    }, "image/jpeg");
  });
}
