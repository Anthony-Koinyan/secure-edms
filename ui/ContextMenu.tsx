'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import DefaultMenu from './DefaultContextMenu';
import TrashMenu from './TrashContextMenu';

import type { FileObject } from '@/lib/types';

export default ({
  close,
  cursorPosition,
  file,
}: {
  close: () => void;
  cursorPosition?: { x: number; y: number };
  file: FileObject;
}) => {
  const path = usePathname();
  const popupRef = useRef<HTMLDivElement>(null);
  const [menuType, setMenuType] = useState<'default' | 'trash'>('default');

  useEffect(() => {
    const menu = path.startsWith('/Trash') ? 'trash' : 'default';
    setMenuType(menu);
  });

  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  useEffect(() => {
    const popupRect = popupRef.current?.getBoundingClientRect();

    if (popupRect && cursorPosition) {
      const spaceAboveCursor = cursorPosition.y;
      const spaceBelowCursor = window.innerHeight - cursorPosition.y;
      const spaceLeftOfCursor = cursorPosition.x;
      const spaceRightOfCursor = window.innerWidth - cursorPosition.x;

      const position: { top: number; left: number } = { top: 0, left: 0 };

      if (
        spaceBelowCursor >= popupRect.height ||
        spaceBelowCursor >= spaceAboveCursor
      ) {
        // position below cursor
        position.top = cursorPosition.y + 10;
      } else {
        // position above cursor
        position.top = cursorPosition.y - popupRect.height - 10;
      }

      if (
        spaceRightOfCursor >= popupRect.width ||
        spaceRightOfCursor >= spaceLeftOfCursor
      ) {
        // position to the left of cursor
        position.left = cursorPosition.x + 10;
      } else {
        // position to the right of cursor
        position.left = cursorPosition.x - popupRect.width - 10;
      }

      setPopupPosition(position);
    }
  }, [cursorPosition]);

  return (
    <>
      <div
        className="fixed top-0 left-0 rounded-xl w-screen h-screen z-[90] bg-gray-800 opacity-5"
        onClick={close}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      ></div>
      <div
        className="fixed z-[91] h-fit w-fit bg-[#FEFEFE] shadow-2xl rounded-md"
        style={{ top: popupPosition.top, left: popupPosition.left }}
        ref={popupRef}
      >
        {menuType === 'default' && <DefaultMenu file={file} close={close} />}
        {menuType === 'trash' && <TrashMenu file={file} close={close} />}
      </div>
    </>
  );
};
