import { ReactNode, useEffect, useState, useTransition } from 'react';
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
  onValid?: ReactHookForm.SubmitHandler<TFieldValues>;
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
    <form
      id={id}
      className={className}
      onSubmit={event => {
        if (!onValid) {
          return;
        }

        form.handleSubmit(onValid, onInvalid)(event);
      }}
    >
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
   * Whether the default values have been initialized
   */
  isInitialized: boolean;
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
  const persistKey = config?.persistKey ? `${config?.persistKeyPrefix ?? 'form.'}${config?.persistKey}` : undefined;
  const persistValues = persist.session<TFieldValues>(persistKey);
  const [isInitialized, setIsInitialized] = useState(false);

  const form = ReactHookForm.useForm<TFieldValues, TContext, TFieldValues>({
    ...config,
    defaultValues: async (...args) => {
      const persistedValues = persistValues.get() as ReactHookForm.DefaultValues<TFieldValues>;
      let defaultValues: ReactHookForm.DefaultValues<TFieldValues> | undefined =
        config?.defaultValues as ReactHookForm.DefaultValues<TFieldValues>;

      if (typeof config?.defaultValues === 'function') {
        defaultValues = (await (config?.defaultValues as (...p: unknown[]) => Promise<TFieldValues | undefined>)?.(
          ...args
        )) as typeof defaultValues;
      }

      setIsInitialized(true);

      return {
        ...defaultValues,
        ...persistedValues,
      } as TFieldValues;
    },
    reValidateMode: 'onChange',
  });

  const values = form.watch();
  const valuesKey = useMemoKey(values);

  /**
   * Save the form values to browser storage
   */
  const saveValuesToStorage = () => {
    startTransition(() => {
      if (isServer || !persistKey || !isInitialized) return;

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

  return { ...form, removePersistedValues, clear, isPending, isInitialized };
};
