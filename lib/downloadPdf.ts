import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import sigefApi from '@/services/sigefApi';

// Intent.FLAG_GRANT_READ_URI_PERMISSION — lets the external viewer read our content:// URI
const FLAG_GRANT_READ_URI_PERMISSION = 1;

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

async function sharePdf(localUri: string, dialogTitle?: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este dispositivo no permite abrir archivos PDF.');
  }
  await Sharing.shareAsync(localUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle,
  });
}

/**
 * Downloads a PDF from an endpoint that requires the Bearer header (so the
 * URL can't be handed to an external viewer) and caches it locally. On
 * Android it opens the "Open with" chooser (ACTION_VIEW), falling back to the
 * share sheet when no installed app handles PDFs; on iOS it uses the share sheet.
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

  if (Platform.OS === 'android') {
    try {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/pdf',
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
      return;
    } catch {
      // No PDF viewer installed (ActivityNotFoundException) — use the share sheet instead
    }
  }
  await sharePdf(localUri, dialogTitle);
}

async function deletePdfsIn(dirUri: string) {
  const names = await FileSystem.readDirectoryAsync(dirUri);
  await Promise.all(
    names
      .filter((name) => name.toLowerCase().endsWith('.pdf'))
      .map((name) => FileSystem.deleteAsync(`${dirUri}${name}`, { idempotent: true }))
  );
}

/**
 * Removes cached PDFs: the ones opened via openAuthenticatedPdf (cache root)
 * and the evidence copies made by expo-document-picker (cache/DocumentPicker/).
 * Meant to run once on cold start; never throws.
 */
export async function clearCachedPdfs() {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return; // web

  await Promise.all(
    [cacheDir, `${cacheDir}DocumentPicker/`].map((dir) => deletePdfsIn(dir).catch(() => {}))
  );
}
