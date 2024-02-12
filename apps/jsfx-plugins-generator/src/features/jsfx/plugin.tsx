import { Form } from '@utils-common';
import { saveAs } from 'file-saver';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { UseFieldArrayReturn, UseFormReturn, useFieldArray } from 'react-hook-form';

import { Icon } from '@jsfx-plugins-generator/components/icon';
import { useToast } from '@jsfx-plugins-generator/components/toast/toast';
import { Tooltip } from '@jsfx-plugins-generator/components/tooltip';

import { blockTemplate, jsfxPluginTemplate } from '@jsfx-plugins-generator/features/jsfx/plugin.template';

import styles from './plugin.module.scss';

export type SliderProps = {
  /**
   * min: 0
   * max: 127
   */
  minValue: number | undefined;
  /**
   * min: 0
   * max: 127
   */
  maxValue: number | undefined;
  /**
   * min: 0
   * max: 127
   */
  defaultValue: number | undefined;
  /**
   * min: 0
   * max: 127
   */
  cc: number | undefined;
  /**
   * The name of the Slider
   */
  name: string;
  /**
   * Whether it should act as a boolean (switch), and a range
   */
  type: 'switch' | 'range';
};

export const sliderDefault: Omit<SliderProps, 'name'> = {
  minValue: 0,
  maxValue: 127,
  defaultValue: 64,
  cc: 1,
  type: 'range',
};

type SliderFormValues = {
  name: string;
  useChannels?: boolean; // TODO
  sliders: (SliderProps & { value?: string })[];
};

const defaultValues: SliderFormValues = {
  name: 'My Plugin',
  sliders: [
    {
      ...sliderDefault,
      cc: 1,
      defaultValue: undefined,
      maxValue: undefined,
      minValue: undefined,
      name: 'Slider1',
      type: 'range',
    },
  ],
};

export const SliderForm = () => {
  const form = Form.useForm<SliderFormValues>({ defaultValues, persistKey: 'jsfx-plugin' });
  const timeout = useRef<number>();
  const toast = useToast();

  const fieldArray = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'sliders', // unique name for your Field Array,
  });

  const onSubmit = (data: SliderFormValues) => console.log(data);

  // If the user manages to delete all sliders - add one back
  useEffect(() => {
    if (fieldArray.fields.length === 0) {
      timeout.current = window.setTimeout(() => {
        fieldArray.append({ ...sliderDefault, name: 'Slider1' });
      }, 200);
    }

    return () => {
      window.clearTimeout(timeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldArray?.fields?.length]);

  // The template for the JSFX plugin
  const template = jsfxPluginTemplate
    .replace(/%PLUGIN_NAME%/, form.watch('name'))
    .replace(
      /%DATE%/,
      new Intl.DateTimeFormat('en-Gb', {
        timeStyle: 'medium',
        dateStyle: 'medium',
      }).format(new Date())
    )
    .replace(
      /%SLIDERS%/,
      form.watch('sliders')?.reduce((acc, slider, index) => {
        return `${acc}slider${index + 1}:${slider.defaultValue}<${slider.minValue},${slider.maxValue},1>${
          slider.name
        } (${slider.cc})\n`;
      }, '')
    )
    .replace(
      /%BLOCKS%/,
      form.watch('sliders')?.reduce((acc, slider, index) => {
        return `${acc}${blockTemplate
          .replace(/%SLIDER_INDEX%/g, (index + 1).toString())
          .replace(/%SLIDER_CC%/g, (slider?.cc || 1)?.toString())}\n`;
      }, '')
    );

  const handleUploadPresetFromClipboard = () => {
    navigator.clipboard.readText().then(text => {
      try {
        const data = JSON.parse(text);

        form.reset(data);

        toast.info({
          title: 'Upload successful',
        });
      } catch (error) {
        if (error) {
          toast.error({
            title: 'Error',
            message:
              'Invalid JSON. Make sure that the preset in your clipboard is valid. Note that you can not upload a *.jsfx plugin - it needs to be the preset',
          });
        }
      }
    });
  };

  const handleDownloadPreset = () => {
    const fileName = `${form.watch('name')}.json`;

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(form.getValues())], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  const handleDownloadPlugin = () => {
    const fileName = `${form.watch('name')}.jsfx`;

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(template)], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  return (
    <Form onValid={onSubmit} form={form} className={styles.form}>
      <div className={styles.fields}>
        <fieldset className={styles.info}>
          <legend>Plugin information</legend>
          <label>
            Name
            <input placeholder={'Plugin name'} className={styles.input} {...form?.register('name')} />
          </label>

          <div className={styles.control}>
            <Tooltip content="Upload preset from clipboard">
              <button type="button" onClick={handleUploadPresetFromClipboard} data-icon>
                <Icon icon="CloudArrowUpIcon" />
              </button>
            </Tooltip>
            <Tooltip content="Download preset">
              <button type="button" onClick={handleDownloadPreset} data-icon>
                <Icon icon="CloudArrowDownIcon" />
              </button>
            </Tooltip>
            <Tooltip content="Clear">
              <button
                type="button"
                data-icon
                onClick={() => {
                  form.reset(defaultValues);
                }}
              >
                <Icon icon="TrashIcon" />
              </button>
            </Tooltip>
          </div>
        </fieldset>
        <fieldset className={styles.sliders}>
          <legend>Sliders</legend>
          <AnimatePresence>
            {fieldArray.fields.map((field, index) => (
              <SliderField
                key={field.id} // important to include key with field's id
                index={index}
                form={form}
                fieldArray={fieldArray}
                {...field}
              />
            ))}
          </AnimatePresence>
        </fieldset>
      </div>

      <div className={styles.code}>
        <h3>Click the code block to copy</h3>

        <Tooltip content="Download plugin">
          <button type="button" onClick={handleDownloadPlugin} className={styles.download}>
            <Icon icon="DocumentArrowDownIcon" />
          </button>
        </Tooltip>

        <pre
          className={styles.pre}
          onClick={event => {
            const { textContent } = event.target as HTMLElement;

            if (!textContent) {
              return;
            }

            navigator.clipboard.writeText(textContent);

            toast.success({
              title: 'Copied to clipboard',
            });
          }}
        >
          {template}
        </pre>
      </div>
    </Form>
  );
};

export const SliderField = ({
  id,
  name,
  index,
  form,
  fieldArray,
}: SliderProps & {
  id?: string;
  value?: string;
  index: number;
  form: UseFormReturn<SliderFormValues, any, SliderFormValues>;
  fieldArray: UseFieldArrayReturn<SliderFormValues, 'sliders', 'id'>;
}) => {
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
          Name
          <input
            key={id}
            placeholder={name || 'Slider name'}
            className={styles.input}
            {...form?.register(`sliders.${index}.name`)}
          />
        </label>
        <label>
          CC Value
          <input
            key={id}
            placeholder={'1'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.cc`)}
          />
        </label>
        <label>
          Default Value
          <input
            key={id}
            placeholder={'64'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.defaultValue`)}
          />
        </label>
        <label>
          Min Value
          <input
            key={id}
            placeholder={'0'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.minValue`)}
          />
        </label>
        <label>
          Max Value
          <input
            key={id}
            placeholder={'127'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.maxValue`)}
          />
        </label>
      </div>
      <div className={styles.control}>
        <Tooltip content="Move up">
          <button data-icon type="button" disabled={index === 0} onClick={() => fieldArray.move(index, index - 1)}>
            <Icon icon="ChevronUpIcon" />
          </button>
        </Tooltip>
        <Tooltip content="Move down">
          <button
            data-icon
            type="button"
            disabled={fieldArray.fields.length === index + 1}
            onClick={() => fieldArray.move(index, index + 1)}
          >
            <Icon icon="ChevronDownIcon" />
          </button>
        </Tooltip>
        <Tooltip content="Add slider">
          <button
            data-icon
            type="button"
            onClick={() =>
              fieldArray.insert(index + 1, { ...sliderDefault, name: `Slider${fieldArray.fields.length + 1}` })
            }
          >
            <Icon icon="PlusIcon" />
          </button>
        </Tooltip>
        <Tooltip content="Remove slider">
          <button
            data-icon
            type="button"
            disabled={fieldArray.fields.length === 1}
            onClick={() => {
              if (fieldArray.fields.length === 1) {
                return;
              }

              return fieldArray.remove(index);
            }}
          >
            <Icon icon="MinusIcon" />
          </button>
        </Tooltip>
      </div>
    </motion.div>
  );
};
