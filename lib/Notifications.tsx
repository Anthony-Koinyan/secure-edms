'use client';

import React, { createContext, useReducer, useContext, Reducer } from 'react';

interface Notification {
  id: string;
  message: string;
  status: 'loading' | 'success' | 'error' | 'info';
  progress?: number;
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationAction {
  type: 'ADD_NOTIFICATION' | 'REMOVE_NOTIFICATION' | 'UPDATE_NOTIFICATION';
  payload: {
    id?: string;
    message?: string;
    status?: 'loading' | 'success' | 'error' | 'info';
    progress?: number;
  };
}

interface NotificationContextProps extends NotificationState {
  addNotification: (
    message: string,
    status?: Notification['status'],
    progress?: number,
  ) => string;
  removeNotification: (id: string) => void;
  updateNotification: (
    id: string,
    status: 'loading' | 'success' | 'error' | 'info',
    message: string,
    progress?: number,
  ) => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  addNotification: () => '',
  removeNotification: () => {},
  updateNotification: () => {},
});

const notificationReducer: Reducer<NotificationState, NotificationAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        notifications: [
          ...state.notifications,
          {
            id: action.payload.id!,
            message: action.payload.message!,
            status: action.payload.status!,
            progress: action.payload.progress,
          },
        ],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload.id,
        ),
      };
    case 'UPDATE_NOTIFICATION':
      return {
        notifications: state.notifications.map((notification) => {
          if (notification.id === action.payload.id) {
            return {
              ...notification,
              status: action.payload.status!,
              message: action.payload.message!,
              progress: action.payload.progress ?? notification.progress,
            };
          }
          return notification;
        }),
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
  });

  const addNotification = (
    message: string,
    status: Notification['status'] = 'loading',
    progress?: number,
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id, message, status, progress },
    });
    return id;
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  };

  const updateNotification = (
    id: string,
    status: 'loading' | 'success' | 'error' | 'info',
    message: string,
    progress?: number,
  ) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION',
      payload: { id, status, message, progress },
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        updateNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
