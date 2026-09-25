import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import sigefApi from '@/services/sigefApi';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  // Chunked to avoid call-stack limits on large PDFs
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Downloads a PDF from an endpoint that requires the Bearer header (so the
 * URL can't be handed to an external viewer), caches it locally and opens
 * it with the native share/viewer sheet.
 */
export async function openAuthenticatedPdf(path: string, filename: string, dialogTitle?: string) {
  const res = await sigefApi.get<ArrayBuffer>(path, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { Accept: 'application/pdf' },
  });

  const localUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(localUri, arrayBufferToBase64(res.data), {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este dispositivo no permite abrir archivos PDF.');
  }
  await Sharing.shareAsync(localUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle,
  });
}
