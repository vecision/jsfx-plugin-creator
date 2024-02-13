'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, getMinMaxAttributesFromChecks } from '@utils-common';
import { saveAs } from 'file-saver';
import { AnimatePresence, motion } from 'framer-motion';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useFieldArray, UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { Icon } from '@jsfx-plugins-generator/components/icon';
import { useToast } from '@jsfx-plugins-generator/components/toast/toast';
import { Tooltip } from '@jsfx-plugins-generator/components/tooltip';

import { fadeInOut } from '@jsfx-plugins-generator/utils/animations';

import { blockTemplate, jsfxPluginTemplate } from '@jsfx-plugins-generator/features/jsfx/plugin.template';

import styles from './plugin.module.scss';

const SliderSchema = z.object({
  name: z.string(),
  defaultValue: z.number().max(127).min(0).default(64).optional(),
  maxValue: z.number().max(127).min(0).default(127).optional(),
  minValue: z.number().max(127).min(0).default(0).optional(),
  cc: z
    .number()
    .max(127)
    .min(0)
    .refine(value => {
      console.log('#87', value);
    })
    .optional(),
  type: z
    .string()
    .default('range')
    .refine(value => {
      if (value === 'range' || value === 'toggle') return true;
    })
    .optional(),
});
type SliderSchemaType = z.infer<typeof SliderSchema>;

const FormSchema = z.object({
  /**
   * The name of the Slider
   */
  name: z.string(),
  useChannels: z.boolean(),
  sliders: z.array(SliderSchema),
});

type FormSchemaType = z.infer<typeof FormSchema>;

type SliderProps = FormSchemaType['sliders'][0];

export const sliderDefault: Omit<SliderProps, 'name'> = {
  defaultValue: 64,
  maxValue: 127,
  minValue: 0,
  cc: undefined,
  type: 'range',
};

const defaultValues: FormSchemaType = {
  name: 'My Plugin',
  useChannels: true,
  sliders: [
    {
      ...sliderDefault,
      name: 'Slider1',
      type: 'range',
    },
  ],
};

type Helpers = keyof FormSchemaType['sliders'][0] | 'pluginName';

export const SliderForm = () => {
  const timeout = useRef<number>();
  const toast = useToast();
  const [helperIsHovered, setHelperIsHovered] = useState<Helpers | null>(null);

  const form = Form.useForm<FormSchemaType>({
    defaultValues,
    persistKey: 'jsfx-plugin',
    resolver: zodResolver(FormSchema),
  });

  const fieldArray = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'sliders', // unique name for your Field Array,
  });

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
  const codeTemplate = jsfxPluginTemplate
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
    const fileToSave = new Blob([JSON.stringify(codeTemplate)], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  return (
    <Form form={form} className={styles.form}>
      <div className={styles.fields}>
        <fieldset className={styles.info}>
          <legend>Plugin information</legend>
          <label>
            Name
            <input
              placeholder={form.isInitialized ? 'Plugin name' : 'Loading...'}
              className={styles.input}
              {...form?.register('name')}
              onFocus={() => setHelperIsHovered('pluginName')}
              onBlur={e => {
                form?.register(`name`).onBlur(e);
                setHelperIsHovered(null);
              }}
            />
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
                setHelperIsHovered={setHelperIsHovered}
                {...field}
              />
            ))}
          </AnimatePresence>
        </fieldset>

        <p className={styles.helpers}>
          <AnimatePresence mode="wait">
            {helperIsHovered === 'pluginName' && (
              <motion.span key="pluginName" {...fadeInOut}>
                The name of the Plugin
                <br></br>
                <code>@default {defaultValues.name}</code>
              </motion.span>
            )}
            {helperIsHovered === 'name' && (
              <motion.span key="name" {...fadeInOut}>
                The name of the slider
                <br></br>
                <code>@default Slider + $index</code>
              </motion.span>
            )}
            {helperIsHovered === 'cc' && (
              <motion.span key="cc" {...fadeInOut}>
                The <code>CC</code> value that will be used to send the <code>MIDI</code> data
                <br></br>
              </motion.span>
            )}
            {helperIsHovered === 'defaultValue' && (
              <motion.span key="defaultValue" {...fadeInOut}>
                The default value when resetting the <code>MIDI</code> controller
                <br></br>
              </motion.span>
            )}
            {helperIsHovered === 'maxValue' && (
              <motion.span key="maxValue" {...fadeInOut}>
                The max value of the <code>MIDI</code> controller. Set to <code>1</code> and it will operate as a
                boolean switch
                <code>true</code>
                <code>/</code>
                <code>false</code>
                <br></br>
              </motion.span>
            )}
            {helperIsHovered === 'minValue' && (
              <motion.span key="minValue" {...fadeInOut}>
                The min value of the <code>MIDI</code> controller
                <br></br>
              </motion.span>
            )}
          </AnimatePresence>
        </p>
      </div>

      <div className={styles.code}>
        <h3>Click the code block to copy</h3>

        <Tooltip content="Download plugin">
          <button type="button" onClick={handleDownloadPlugin} className={styles.download}>
            <Icon icon="DocumentArrowDownIcon" />
          </button>
        </Tooltip>

        <button
          type="button"
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
          <pre className={styles.pre}>{form.isInitialized ? codeTemplate : 'Loading...'}</pre>
        </button>
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
  setHelperIsHovered,
}: SliderProps & {
  id?: string;
  value?: string;
  index: number;
  setHelperIsHovered: Dispatch<SetStateAction<Helpers | null>>;
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>;
  fieldArray: UseFieldArrayReturn<FormSchemaType, 'sliders', 'id'>;
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
            onFocus={() => setHelperIsHovered('name')}
            onBlur={e => {
              form?.register(`sliders.${index}.name`).onBlur(e);
              setHelperIsHovered(null);
            }}
          />
        </label>
        <label>
          CC Value
          <input
            key={id}
            placeholder={'1'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.cc`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.cc._def.innerType._def.schema._def.checks)}
            onFocus={() => setHelperIsHovered('cc')}
            onBlur={e => {
              form?.register(`sliders.${index}.cc`).onBlur(e);
              setHelperIsHovered(null);
            }}
          />
        </label>
        <label>
          Default Value
          <input
            key={id}
            placeholder={'64'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.defaultValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(
              SliderSchema.shape.defaultValue._def.innerType._def.innerType._def.checks
            )}
            onFocus={() => setHelperIsHovered('defaultValue')}
            onBlur={e => {
              form?.register(`sliders.${index}.defaultValue`).onBlur(e);
              setHelperIsHovered(null);
            }}
          />
        </label>
        <label>
          Min Value
          <input
            key={id}
            placeholder={'0'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.minValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.minValue._def.innerType._def.innerType._def.checks)}
            onFocus={() => setHelperIsHovered('minValue')}
            onBlur={e => {
              form?.register(`sliders.${index}.minValue`).onBlur(e);
              setHelperIsHovered(null);
            }}
          />
        </label>
        <label>
          Max Value
          <input
            key={id}
            placeholder={'127'}
            className={styles.number}
            type="number"
            {...form?.register(`sliders.${index}.maxValue`, { valueAsNumber: true })}
            {...getMinMaxAttributesFromChecks(SliderSchema.shape.maxValue._def.innerType._def.innerType._def.checks)}
            onFocus={() => setHelperIsHovered('maxValue')}
            onBlur={e => {
              form?.register(`sliders.${index}.maxValue`).onBlur(e);
              setHelperIsHovered(null);
            }}
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
