import { ReactNode, useEffect, useMemo, useTransition } from 'react';
import * as ReactHookForm from 'react-hook-form';

import { useMemoKey } from './hooks';
import { isServer } from './server';
import { persist } from './storage';

export type FormProps<
  TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues,
  TContext = unknown
> = {
  className?: string;
  children: ReactNode;
  onValid: ReactHookForm.SubmitHandler<TFieldValues>;
  onInvalid?: ReactHookForm.SubmitErrorHandler<TFieldValues>;
  form: UseFormReturnType<TFieldValues, TContext>;
  id?: string;
};

export const Form = <TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues, TContext = unknown>({
  className,
  children,
  form,
  onValid,
  onInvalid,
  id,
}: FormProps<TFieldValues, TContext>) => {
  return (
    <form id={id} className={className} onSubmit={form.handleSubmit(onValid, onInvalid)}>
      {children}
    </form>
  );
};

export type UseFormReturnType<
  TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues,
  TContext = unknown
> = ReactHookForm.UseFormReturn<TFieldValues, TContext> & {
  /**
   * Removes the persisted data for browser storage
   */
  removePersistedValues: () => void;
  /**
   * Reset the form and removes the persisted data
   */
  clear: () => void;
  /**
   * Whether the `startTransition` is currently pending
   */
  isPending: boolean;
  /**
   * The persisted values
   */
  persistedValues: ReactHookForm.DefaultValues<TFieldValues> | undefined;
};

Form.useForm = <TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues, TContext = unknown>(
  config?: {
    /**
     * Whether you want the form to be persisted to sessionStorage and restored when returned to.
     */
    persistKey?: string;
    persistKeyPrefix?: string;
  } & ReactHookForm.UseFormProps<TFieldValues, TContext>
): UseFormReturnType<TFieldValues, TContext> => {
  const [isPending, startTransition] = useTransition();
  const persistKey = config?.persistKey ? `${config?.persistKeyPrefix || 'form.'}${config?.persistKey}` : undefined;
  const persistValues = persist.session<TFieldValues>(persistKey);

  /**
   * The form values persisted in browser storage
   */
  const persistedValues = useMemo<ReactHookForm.DefaultValues<TFieldValues> | undefined>(() => {
    if (isServer || !persistKey) return;

    const persistedValues = persistValues.get() as ReactHookForm.DefaultValues<TFieldValues>;

    const defaultValues: ReactHookForm.DefaultValues<TFieldValues> | undefined =
      typeof config?.defaultValues === 'function'
        ? ({} as ReactHookForm.DefaultValues<TFieldValues>)
        : config?.defaultValues;

    return {
      ...defaultValues,
      ...persistedValues,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  const form = ReactHookForm.useForm<TFieldValues, TContext, TFieldValues>({
    ...config,
    defaultValues: persistedValues,
    reValidateMode: 'onChange',
  });

  const values = form.watch();
  const valuesKey = useMemoKey(values);

  /**
   * Save the form values to browser storage
   */
  const saveValuesToStorage = () => {
    startTransition(() => {
      if (isServer || !persistKey) return;

      persistValues.set(values);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(saveValuesToStorage, [valuesKey, persistKey]);

  /**
   * Removes the persisted data for browser storage
   */
  const removePersistedValues = () => {
    if (isServer || !persistKey) return;
    persistValues.remove();
  };

  /**
   * Removes the persisted data and resets the form values
   * @see {@link removePersistedValues}
   */
  const clear = () => {
    removePersistedValues();

    form.reset(values => {
      for (const key in values) {
        values[key] = '' as TFieldValues[Extract<keyof TFieldValues, string>];
      }

      return { ...values, ...config?.defaultValues };
    });
  };

  return { ...form, removePersistedValues, clear, isPending, persistedValues };
};
