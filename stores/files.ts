import { atom } from 'nanostores';

import { FileObject } from '@/lib/types';

export const fileStore = atom<FileObject[]>([]);

export const initStore = (files: FileObject[]) => {
  fileStore.set([...files]);
};

export const addToStore = (file: FileObject[]) => {
  fileStore.set([...fileStore.get(), ...file]);
};

export const removeFromStore = (id: string) => {
  const filtered = fileStore.get().filter((file) => file.id !== id);

  fileStore.set(filtered);
};
