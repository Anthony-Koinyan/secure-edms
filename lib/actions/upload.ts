// 'use server';

// import { NextRequest } from 'next/server';

// import { createClient } from '@/utils/supabase-server';

// import { useNotification } from '../Notifications';

// type OverlayCloseFunction = () => void;
// type AddNotification = ReturnType<typeof useNotification>['addNotification'];
// type UpdateNotification = ReturnType<
//   typeof useNotification
// >['updateNotification'];

// export const createFolder = async ({
//   folderName,
//   close,
//   addNotification,
//   updateNotification,
// }: {
//   folderName: string;
//   close: OverlayCloseFunction;
//   addNotification: AddNotification;
//   updateNotification: UpdateNotification;
// }) => {
//   const supabase = createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const path = NextRequest.;

//   const notificationId = addNotification(`Creating ${folderName}`);

//   const dir = `/${user?.id}${path
//     .split('-')
//     .join(' ')}/${folderName}/.placeholder`;

//   const { error } = await supabase.storage.from('Files').upload(dir, '');

//   if (error) {
//     console.log(error);
//     return updateNotification(
//       notificationId,
//       'error',
//       error.message === 'The resource already exists'
//         ? `${folderName} already exists`
//         : `Failed to create ${folderName}`,
//     );
//   }

//   updateNotification(notificationId, 'success', `${folderName} created`);

//   close();
// };

export default 'foo';
