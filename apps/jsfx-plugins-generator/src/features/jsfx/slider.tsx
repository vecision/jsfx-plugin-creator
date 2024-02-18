import { getMinMaxAttributesFromChecks } from '@utils-common';
import { motion } from 'framer-motion';
import { Dispatch, InputHTMLAttributes, SetStateAction } from 'react';
import { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';

import { Actions } from '@jsfx-plugins-generator/components/actions/actions';

import { FormSchemaType, Helpers, SliderSchema } from '@jsfx-plugins-generator/features/jsfx/plugin';

import styles from './plugin.module.scss';
type SliderProps = FormSchemaType['sliders'][0];

export const sliderDefault: Omit<SliderProps, 'name'> = {
  defaultValue: 64,
  maxValue: 127,
  minValue: 0,
  cc: undefined,
  type: 'range',
};

export const SliderField = ({
  id,
  name,
  index,
  form,
  fieldArray,
  setHelperIsHovered,
}: SliderProps & {
  id?: string;
  value?: string;
  index: number;
  setHelperIsHovered: Dispatch<SetStateAction<Helpers | null>>;
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
  fieldArray: UseFieldArrayReturn<FormSchemaType, 'sliders', 'id'>;
}) => {
  const getHelperAttributes = (id: string, fieldId: string) => {
    const show = () => {
      return setHelperIsHovered(id as Helpers);
    };

    const hide: InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>['onBlur'] = event => {
      form?.register(fieldId as keyof FormSchemaType).onBlur(event);
      setHelperIsHovered(null);
    };

    return {
      onMouseOver: show,
      onFocus: show,
      // We accept that the type doesn't match here as we don't care about the difference of
      // input event vs mouse event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onMouseLeave: hide as any,
      onBlur: hide,
    } satisfies InputHTMLAttributes<HTMLInputElement>;
  };

  return (
    <motion.div
      transition={{ duration: 0.15 }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={styles.slider}
    >
      <div className={styles.inputs}>
        <label>
          Name{' '}
          <input
            key={id}
            placeholder={name || 'Slider name'}
            className={styles.input}
            {...form?.register(`sliders.${index}.name`)}
            {...getHelperAttributes('name', `sliders.${index}.name`)}
          />
        </label>
        <label>
          CC Value{' '}
          <input
            key={id}
            placeholder={'1'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.cc`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.cc._def.innerType._def.schema._def.checks)}
            {...getHelperAttributes('cc', `sliders.${index}.cc`)}
          />
        </label>
        <label>
          Default Value{' '}
          <input
            key={id}
            placeholder={'64'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.defaultValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(
              SliderSchema.shape.defaultValue._def.innerType._def.innerType._def.checks
            )}
            {...getHelperAttributes('defaultValue', `sliders.${index}.defaultValue`)}
          />
        </label>
        <label>
          Min Value{' '}
          <input
            key={id}
            placeholder={'0'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.minValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.minValue._def.innerType._def.innerType._def.checks)}
            {...getHelperAttributes('minValue', `sliders.${index}.minValue`)}
          />
        </label>
        <label>
          Max Value{' '}
          <input
            key={id}
            placeholder={'127'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.maxValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.maxValue._def.innerType._def.innerType._def.checks)}
            {...getHelperAttributes('maxValue', `sliders.${index}.maxValue`)}
          />
        </label>
        <label>
          Type{' '}
          <select
            key={id}
            value="range"
            className={styles.type}
            disabled
            aria-readonly
            {...form?.register(`sliders.${index}.type`)}
            {...getHelperAttributes('type', `sliders.${index}.type`)}
          >
            <option value="range">Range</option>
            <option value="toggle">Toggle</option>
          </select>
        </label>
      </div>
      <Actions
        className={styles.control}
        items={[
          {
            id: 'move-up',
            tooltip: { content: 'Move up' },
            icon: { icon: 'ChevronUpIcon', scale: 1.2 },
            disabled: index === 0,
            onClick: () => fieldArray.move(index, index - 1),
          },
          {
            id: 'move-down',
            tooltip: { content: 'Move down' },
            icon: { icon: 'ChevronDownIcon', scale: 1.2 },
            disabled: fieldArray.fields.length === index + 1,
            onClick: () => fieldArray.move(index, index + 1),
          },
          {
            id: 'add',
            tooltip: { content: 'Add slider' },
            icon: { icon: 'PlusIcon', scale: 1.2 },
            onClick: () =>
              fieldArray.insert(index + 1, { ...sliderDefault, name: `Slider${fieldArray.fields.length + 1}` }),
          },
          {
            id: 'remove',
            tooltip: { content: 'Remove slider' },
            icon: { icon: 'MinusIcon', scale: 1.2 },
            disabled: fieldArray.fields.length === 1,
            onClick: () => {
              if (fieldArray.fields.length === 1) {
                return;
              }

              return fieldArray.remove(index);
            },
          },
        ]}
      />
    </motion.div>
  );
};
