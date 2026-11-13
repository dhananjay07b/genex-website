/** Images people upload from GeLearn (photos, covers, editor images): the formats the backend accepts. */
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',')
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/** Why `file` can't be uploaded, or null when it can (checked before upload, so the error shows at once). */
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Choose a PNG, JPG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be 10 MB or smaller.'
  return null
}
