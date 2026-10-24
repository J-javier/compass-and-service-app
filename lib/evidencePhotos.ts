import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { UploadFile } from '@/hooks/useReports';

/** Longest side after resizing; keeps each photo well under SIGEF's 10 MB limit. */
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.7;

export type PhotoSource = 'camera' | 'library';

/** Thrown when the camera or photo library permission is denied; the message is user-facing. */
export class PhotoPermissionError extends Error {
  constructor(source: PhotoSource) {
    super(
      source === 'camera'
        ? 'Necesitamos acceso a la cámara para tomar la foto. Actívalo en los ajustes del teléfono.'
        : 'Necesitamos acceso a tus fotos para adjuntarla. Actívalo en los ajustes del teléfono.',
    );
  }
}

/**
 * Takes or picks one evidence photo and re-encodes it as a resized JPEG.
 * SIGEF only accepts jpg/png/webp, so re-encoding also converts iPhone HEIC.
 * Returns null when the student cancels.
 */
export async function pickEvidencePhoto(source: PhotoSource, name: string): Promise<UploadFile | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new PhotoPermissionError(source);

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, exif: false };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_SIDE) {
    context.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  context.release();
  image.release();

  return { uri: saved.uri, name: `${name}.jpg`, type: 'image/jpeg' };
}
