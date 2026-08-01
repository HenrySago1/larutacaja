import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadProductImage(file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
  const path = `productos/${Date.now()}-${safeName}`;
  const snapshot = await uploadBytes(ref(storage, path), file);
  return getDownloadURL(snapshot.ref);
}
