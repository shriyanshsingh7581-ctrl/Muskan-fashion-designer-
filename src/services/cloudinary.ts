export const DEFAULT_CLOUDINARY_CONFIG = {
  cloudName: 'dxeuzdwkz',
  uploadPreset: 'Muskaan fashion designer',
};

export async function uploadImageToCloudinary(
  file: File,
  customCloudName?: string,
  customPreset?: string
): Promise<string> {
  const cloudName = (customCloudName || DEFAULT_CLOUDINARY_CONFIG.cloudName).trim();
  const preset = (customPreset || DEFAULT_CLOUDINARY_CONFIG.uploadPreset).trim();

  // Primary attempt
  const tryUpload = async (presetName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', presetName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Cloudinary upload failed (status ${response.status})`);
    }

    const data = await response.json();
    return data.secure_url || data.url;
  };

  try {
    return await tryUpload(preset);
  } catch (firstErr: any) {
    console.warn(`Initial Cloudinary upload attempt with "${preset}" failed:`, firstErr.message);

    // If preset name has spaces, Cloudinary users sometimes define it with underscores or dashes:
    const variations = [
      preset.replace(/\s+/g, '_'), // e.g. Muskaan_fashion_designer
      preset.replace(/\s+/g, '-'), // e.g. Muskaan-fashion-designer
      preset.toLowerCase().replace(/\s+/g, '_'), // e.g. muskaan_fashion_designer
      preset.toLowerCase().replace(/\s+/g, '-'), // e.g. muskaan-fashion-designer
      preset.replace(/\s+/g, ''), // e.g. Muskaanfashiondesigner
    ];

    for (const altPreset of variations) {
      if (altPreset !== preset) {
        try {
          console.log(`Retrying Cloudinary upload with preset: "${altPreset}"`);
          return await tryUpload(altPreset);
        } catch {
          // continue
        }
      }
    }

    // If all Cloudinary attempts fail (e.g. offline or preset misconfigured on Cloudinary dashboard),
    // convert file to high quality Data URL so the boutique owner NEVER loses their upload!
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
