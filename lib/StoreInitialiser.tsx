'use client';

import { useEffect } from 'react';
import { initStore } from 'stores/files';
import { FileObject } from './types';

export default ({ files }: { files: FileObject[] }) => {
  useEffect(() => {
    initStore(files);
  });
  return null;
};
