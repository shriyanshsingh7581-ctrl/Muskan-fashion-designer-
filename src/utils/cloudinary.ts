export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export const DEFAULT_CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: 'dxeuzdwkz',
  uploadPreset: 'Muskaan fashion designer',
};

export interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id: string;
  version?: number;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  url: string;
  secure_url: string;
  created_at?: string;
}

/**
 * Uploads an image file or blob directly to Cloudinary using unsigned upload preset
 */
export function uploadToCloudinary(
  file: File | Blob,
  options?: {
    cloudName?: string;
    uploadPreset?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<CloudinaryUploadResponse> {
  const cloudName = (options?.cloudName || DEFAULT_CLOUDINARY_CONFIG.cloudName).trim();
  const uploadPreset = (options?.uploadPreset || DEFAULT_CLOUDINARY_CONFIG.uploadPreset).trim();

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (options?.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve(response);
        } else {
          const errMsg =
            response.error?.message ||
            `Cloudinary upload error (${xhr.status}): ${xhr.statusText}`;
          reject(new Error(errMsg));
        }
      } catch (err: any) {
        reject(new Error('Cloudinary response parsing failed: ' + err.message));
      }
    };

    xhr.onerror = () => {
      reject(new Error('नेटवर्क त्रुटि: Cloudinary से कनेक्ट नहीं हो सका (Network error).'));
    };

    xhr.send(formData);
  });
}

/**
 * Tests Cloudinary connection by uploading a 1x1 test image
 */
export async function testCloudinaryConnection(
  cloudName = DEFAULT_CLOUDINARY_CONFIG.cloudName,
  uploadPreset = DEFAULT_CLOUDINARY_CONFIG.uploadPreset
): Promise<{ success: boolean; message: string; sampleUrl?: string }> {
  try {
    // 1x1 transparent PNG blob
    const byteCharacters = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const result = await uploadToCloudinary(blob, {
      cloudName,
      uploadPreset,
    });

    return {
      success: true,
      message: 'Cloudinary सफलता पूर्वक कनेक्ट हो गया है! (Connected successfully)',
      sampleUrl: result.secure_url,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'कनेक्शन विफल रहा। कृपया Cloud Name व Preset जांचें।',
    };
  }
}
