'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, getMinMaxAttributesFromChecks, persist, UseFormReturnType } from '@utils-common';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dispatch,
  InputHTMLAttributes,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useFieldArray, UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@jsfx-plugins-generator/components/actions/actions';
import { Dialog } from '@jsfx-plugins-generator/components/dialog/dialog';
import { useToast } from '@jsfx-plugins-generator/components/toast/toast';
import { Tooltip } from '@jsfx-plugins-generator/components/tooltip/tooltip';

import { fadeInOut } from '@jsfx-plugins-generator/utils/animations';

import { blockTemplate, jsfxPluginTemplate } from '@jsfx-plugins-generator/features/jsfx/plugin.template';

import styles from './plugin.module.scss';

const toMemoKey = <T,>(values: T) => JSON.stringify(values);

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
// type SliderSchemaType = z.infer<typeof SliderSchema>;

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

type Helpers = keyof FormSchemaType['sliders'][0] | 'pluginName' | 'uploadPreset';

const HELPERS = {
  pluginName: (
    <motion.p key="pluginName" {...fadeInOut}>
      <span>The name of the Plugin</span>
      <code>@default {defaultValues.name}</code>
    </motion.p>
  ),
  name: (
    <motion.p key="name" {...fadeInOut}>
      <span>The name of the slider</span>
      <code>@default Slider + $index</code>
    </motion.p>
  ),
  cc: (
    <motion.p key="cc" {...fadeInOut}>
      <span>The</span>
      <code>CC</code>
      <span>value that will be used to send the</span>
      <code>MIDI</code>
      <span>data</span>
    </motion.p>
  ),
  defaultValue: (
    <motion.p key="defaultValue" {...fadeInOut}>
      <span>The default value when resetting the</span>
      <code>MIDI</code>
      <span>controller</span>
    </motion.p>
  ),
  maxValue: (
    <motion.p key="maxValue" {...fadeInOut}>
      <span>The max value of the</span>
      <code>MIDI</code> <span>controller. Set to</span> <code>1</code>{' '}
      <span>and it will operate as a boolean switch</span>
      <code>true</code>
      <code>/</code>
      <code>false</code>
    </motion.p>
  ),
  minValue: (
    <motion.p key="minValue" {...fadeInOut}>
      The min value of the <code>MIDI</code> controller
      <br />
    </motion.p>
  ),
  uploadPreset: (
    <motion.p key="uploadPreset" {...fadeInOut}>
      You can also drag and drop a preset anywhere on the screen to upload it
      <br />
    </motion.p>
  ),
} satisfies Partial<Record<Helpers, ReactNode>>;

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
  const codeTemplate = useCodeTemplate(form);

  const handleDownloadPlugin = () => {
    const fileName = `${form.watch('name')}.jsfx`;

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(codeTemplate)], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  const haveShownDialog = persist.session<boolean>('haveShownDialog');

  const introDialog = Dialog.useDialog({
    isInitiallyOpen: haveShownDialog.get() !== true,
    onClose: () => {
      haveShownDialog.set(true);
    },
  });

  const { uploadPreset, handleUploadPresetFromClipboard, handleDownloadPreset } = usePreset(form, toast);

  const onDrop: DropzoneOptions['onDrop'] = useCallback(
    async ([file]: File[]) => {
      const text = await file.text();

      uploadPreset(text);
    },
    [uploadPreset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.json'],
    },
  });

  const rootProps = getRootProps();

  return (
    <div
      className={classNames(styles.plugin)}
      ref={rootProps.refKey}
      onDrop={rootProps.onDrop}
      onDragEnter={rootProps.onDragEnter}
      onDragLeave={rootProps.onDragLeave}
      onDragOver={rootProps.onDragEnter}
    >
      <Form form={form} className={styles.form}>
        <div className={styles.fields}>
          <fieldset className={styles.info}>
            <legend>Plugin information</legend>
            <label>
              Name{' '}
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
              <Tooltip content="See intro text again">
                <Button icon={{ icon: 'InformationCircleIcon' }} onClick={introDialog.setOpen} />
              </Tooltip>
              <Tooltip content="Upload preset from clipboard">
                <Button
                  icon={{ icon: 'CloudArrowUpIcon' }}
                  onClick={handleUploadPresetFromClipboard}
                  onFocus={() => setHelperIsHovered('uploadPreset')}
                  onMouseOver={() => setHelperIsHovered('uploadPreset')}
                  onBlur={() => {
                    setHelperIsHovered(null);
                  }}
                  onMouseLeave={() => {
                    setHelperIsHovered(null);
                  }}
                />
              </Tooltip>
              <Tooltip content="Download preset">
                <Button icon={{ icon: 'CloudArrowDownIcon' }} onClick={handleDownloadPreset} />
              </Tooltip>
              <Tooltip content="Clear">
                <Button
                  icon={{ icon: 'TrashIcon' }}
                  onClick={() => {
                    form.reset(defaultValues);
                  }}
                />
              </Tooltip>
            </div>
          </fieldset>
          <fieldset className={styles.sliders}>
            <legend>Sliders</legend>
            <AnimatePresence>
              {fieldArray.fields.map((field, index) => (
                <SliderField
                  key={field.id}
                  index={index}
                  form={form}
                  fieldArray={fieldArray}
                  setHelperIsHovered={setHelperIsHovered}
                  {...field}
                />
              ))}
            </AnimatePresence>
          </fieldset>

          <div className={styles.helpers}>
            <AnimatePresence mode="wait">{HELPERS?.[helperIsHovered as keyof typeof HELPERS]}</AnimatePresence>
          </div>
        </div>

        <div className={styles.code}>
          <h3>Click the code block to copy</h3>

          <Tooltip content="Download plugin">
            <Button
              icon={{ icon: 'DocumentArrowDownIcon' }}
              onClick={handleDownloadPlugin}
              className={styles.download}
            />
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

      <div
        className={classNames(styles.dropzone, {
          [styles.dragActive]: isDragActive,
        })}
      >
        <div className={styles.line} />
        <input {...getInputProps()} />
        {<p className={styles.text}>Drop here to upload preset</p>}
      </div>
      <Dialog dialog={introDialog} title="Thank you for using the the JSFX Plugin Generator for Reaper">
        <p>asdfhasdfh ashfdsa jkh fsdkhj</p>
        <Dialog.Actions
          alignment="flex-end"
          items={[
            {
              id: 'confirm',
              label: 'Got it!',
              onClick: introDialog.setClose,
            },
          ]}
        />
      </Dialog>
    </div>
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
  const getHelperAttributes = (id: string, fieldId: string) => {
    const show = () => {
      return setHelperIsHovered(id as Helpers);
    };

    const hide: InputHTMLAttributes<HTMLInputElement>['onBlur'] = event => {
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
      </div>
      <div className={styles.control}>
        <Tooltip content="Move up">
          <Button
            icon={{ icon: 'ChevronUpIcon' }}
            disabled={index === 0}
            onClick={() => fieldArray.move(index, index - 1)}
          />
        </Tooltip>
        <Tooltip content="Move down">
          <Button
            icon={{ icon: 'ChevronDownIcon' }}
            disabled={fieldArray.fields.length === index + 1}
            onClick={() => fieldArray.move(index, index + 1)}
          />
        </Tooltip>
        <Tooltip content="Add slider">
          <Button
            icon={{ icon: 'PlusIcon' }}
            onClick={() =>
              fieldArray.insert(index + 1, { ...sliderDefault, name: `Slider${fieldArray.fields.length + 1}` })
            }
          />
        </Tooltip>
        <Tooltip content="Remove slider">
          <Button
            icon={{ icon: 'MinusIcon' }}
            disabled={fieldArray.fields.length === 1}
            onClick={() => {
              if (fieldArray.fields.length === 1) {
                return;
              }

              return fieldArray.remove(index);
            }}
          />
        </Tooltip>
      </div>
    </motion.div>
  );
};

function usePreset(form: UseFormReturnType<FormSchemaType>, toast: ReturnType<typeof useToast>) {
  const handleDownloadPreset = () => {
    const fileName = `${form.watch('name')}.json`;

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(form.getValues())], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  const formKey = toMemoKey(form.getValues());

  const uploadPreset = useCallback(
    (text: string) => {
      try {
        const data = JSON.parse(text);

        form.reset(data);

        toast.success({
          title: 'Preset was successfully uploaded',
        });
      } catch (error) {
        if (!error) {
          return;
        }

        toast.error({
          title: 'Error',
          message:
            'Invalid JSON. Make sure that the preset in your clipboard is valid. Note that you can not upload a *.jsfx plugin - it needs to be the preset',
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formKey]
  );

  const handleUploadPresetFromClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();

    uploadPreset(text);
  }, [uploadPreset]);

  return { uploadPreset, handleUploadPresetFromClipboard, handleDownloadPreset };
}

function useCodeTemplate(form: UseFormReturnType<FormSchemaType>) {
  return jsfxPluginTemplate
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
}
