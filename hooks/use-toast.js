"use client";

import * as React from "react";

const TOAST_LIMIT = 3;  // Allow 3 toasts at once
const TOAST_REMOVE_DELAY = 4000; // 4 seconds default

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
};

const toastVariants = {
  success: {
    className: "toast-success",
    icon: "✓",
    duration: 3000,
  },
  error: {
    className: "toast-destructive",
    icon: "✕",
    duration: 4000,
  },
  warning: {
    className: "toast-warning",
    icon: "⚠",
    duration: 3500,
  },
  info: {
    className: "bg-primary text-primary-foreground",
    icon: "ℹ",
    duration: 3000,
  },
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId, duration = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

const listeners = [];
let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({
  variant = "default",
  title,
  description,
  duration,
  ...props
}) {
  const id = genId();
  const variantConfig = toastVariants[variant] || toastVariants.default;
  const toastDuration = duration || variantConfig.duration;

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      title,
      description,
      variant,
      className: variantConfig.className,
      icon: variantConfig.icon,
      duration: toastDuration,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
      ...props,
    },
  });

  addToRemoveQueue(id, toastDuration);

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const customToast = React.useMemo(
    () => ({
      success: (message, options = {}) =>
        toast({
          variant: "success",
          title: "Success",
          description: message,
          ...options,
        }),
      error: (message, options = {}) =>
        toast({
          variant: "error",
          title: "Error",
          description: message,
          ...options,
        }),
      warning: (message, options = {}) =>
        toast({
          variant: "warning",
          title: "Warning",
          description: message,
          ...options,
        }),
      info: (message, options = {}) =>
        toast({
          variant: "info",
          title: "Info",
          description: message,
          ...options,
        }),
    }),
    []
  );

  return {
    ...state,
    toast: customToast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };