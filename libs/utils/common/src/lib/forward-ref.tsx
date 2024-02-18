import React from 'react';

export const forwardRef = <T, P = unknown, X = unknown>(args: React.ForwardRefRenderFunction<T, P>) =>
  React.forwardRef<T, P>(args) as React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> &
    X;
