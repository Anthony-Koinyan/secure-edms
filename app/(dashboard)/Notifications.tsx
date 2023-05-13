'use client';
// TODO: reduce the notification timer
import React, { useEffect, useState } from 'react';

import { useNotification } from '@/lib//Notifications';
import {
  faCheckCircle,
  faCircleNotch,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NotificationPopup = () => {
  const { notifications, removeNotification } = useNotification();

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      // Start the timer for closing the notification
      const currentNotification = notifications[notifications.length - 1];

      if (currentNotification.status !== 'loading') {
        setTimer(
          setTimeout(() => removeNotification(currentNotification.id), 3000),
        );
      }
    }
  }, [notifications]);

  const handleNotificationClose = (id: string) => {
    // Clear the timer for closing the notification
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(null);
    removeNotification(id);
  };

  if (notifications.length === 0) {
    return <></>;
  }

  return (
    <div className="fixed right-0 top-28 h-full w-80 p-4 flex flex-col items-end justify-start z-50 text-sm md:text-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`w-full mb-4 p-4 flex items-center justify-start shadow-lg rounded-md ${
            notification.status === 'success'
              ? 'bg-green-300'
              : notification.status === 'error'
              ? 'bg-red-300'
              : 'bg-blue-300'
          }`}
        >
          <div className="mr-4 flex items-center justify-center">
            {notification.status === 'success' ? (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 text-2xl"
              />
            ) : notification.status === 'error' ? (
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="text-red-600 text-2xl"
              />
            ) : (
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="text-[#7070FE] text-2xl"
                spin
              />
            )}
          </div>
          <div className="flex-grow">
            <div
              className={`text-${
                notification.status === 'success'
                  ? 'green'
                  : notification.status === 'error'
                  ? 'red'
                  : 'black'
              }-600 font-medium mb-1`}
            >
              {notification.message}
            </div>
            {notification.progress !== undefined && (
              <div>
                <span className="flex mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      notification.status === 'success'
                        ? 'bg-green-500'
                        : notification.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-[#7070FE]'
                    }`}
                    style={{ width: `${notification.progress}%` }}
                  ></div>
                  <div
                    className="h-2 rounded-full bg-gray-300"
                    style={{ width: `${100 - notification.progress}%` }}
                  ></div>
                </span>
                <span>{notification.progress.toFixed(0)} / 100%</span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <button
              onClick={() => handleNotificationClose(notification.id)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
