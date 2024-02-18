'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, persist } from '@utils-common';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { Actions, Button } from '@jsfx-plugins-generator/components/actions/actions';
import { Dialog, DialogProps } from '@jsfx-plugins-generator/components/dialog/dialog';
import { ReactComponent as Spinner } from '@jsfx-plugins-generator/components/icon/assets/spinner.svg';
import { Splash } from '@jsfx-plugins-generator/components/splash/splash';
import { useToast } from '@jsfx-plugins-generator/components/toast/toast';

import { fadeInOut } from '@jsfx-plugins-generator/utils/animations';

import { usePreset } from '@jsfx-plugins-generator/features/jsfx/preset';
import { sliderDefault, SliderField } from '@jsfx-plugins-generator/features/jsfx/slider';
import { useCodeTemplate } from '@jsfx-plugins-generator/features/jsfx/template';

import styles from './plugin.module.scss';

export const SliderSchema = z.object({
  name: z.string(),
  defaultValue: z.number().max(127).min(0).default(0).optional(),
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
  type: z.union([z.literal('range'), z.literal('toggle')]).optional(),
});

const FormSchema = z.object({
  /**
   * The name of the Slider
   */
  name: z.string(),
  useChannels: z.boolean(),
  sliders: z.array(SliderSchema),
});

export type FormSchemaType = z.infer<typeof FormSchema>;

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

export const SliderForm = () => {
  const timeout = useRef<number>();
  const toast = useToast();
  const [helperIsHovered, setHelperIsHovered] = useState<Helpers | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

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
  const [codeTemplateString, codeTemplate] = useCodeTemplate(form);

  const handleDownloadPlugin = () => {
    const fileName = `${form.watch('name')}.jsfx`;

    // Create a blob of the data
    const fileToSave = new Blob([codeTemplateString], {
      type: 'application/json',
    });

    // Save the file
    saveAs(fileToSave, fileName);
  };

  const handleCopyPresetToClipboard = () => {
    navigator.clipboard.writeText(codeTemplateString);

    toast.success({
      title: 'Copied to clipboard',
    });
  };

  const haveShownDialog = persist.session<boolean>('haveShownDialog');

  const introDialog = Dialog.useDialog({
    isInitiallyOpen: haveShownDialog.get() !== true,
    onClose: () => {
      haveShownDialog.set(true);
    },
  });

  const { uploadPreset, handleUploadPresetFromClipboard, handleDownloadPreset } = usePreset(form);

  const onDrop: DropzoneOptions['onDrop'] = useCallback(
    async ([file]: File[]) => {
      if (file.name.includes('.jsfx')) {
        toast.error({
          title: 'Invalid file',
          message:
            "You have uploaded a *.jsfx file. Please upload a preset *.json file instead as we can't process the jsfx.",
        });
        return;
      }

      const text = await file.text();

      uploadPreset(text);
    },
    [uploadPreset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.json', '.jsfx'],
    },
  });

  const rootProps = getRootProps();

  return (
    <>
      <div
        className={classNames(styles.plugin)}
        ref={rootProps.refKey}
        onDrop={rootProps.onDrop}
        onDragEnter={rootProps.onDragEnter}
        onDragLeave={rootProps.onDragLeave}
        onDragOver={rootProps.onDragEnter}
        role="presentation"
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
                <Actions
                  className={styles.control}
                  items={[
                    {
                      id: 'feature-request',
                      tooltip: { content: 'Support/Feature request' },
                      icon: { icon: 'QuestionMarkCircleIcon' },
                      href: `mailto:kaijurox@gmail.com?subject=jsfx-plugin-generator - Bug/Feature Request&body=If you\'re having issues, please enter what you\'re experiencing and what you are expecting should happen.%0A%0AIf it's a feature request, then please write your idea, how it should work and why it would be useful to others.%0A%0AThank you!`,
                      onFocus: () => setHelperIsHovered('featureRequest'),
                      onMouseOver: () => setHelperIsHovered('featureRequest'),
                      onBlur: () => {
                        setHelperIsHovered(null);
                      },
                      onMouseLeave: () => {
                        setHelperIsHovered(null);
                      },
                    },
                    {
                      id: 'intro',
                      tooltip: { content: 'See intro text again' },
                      icon: { icon: 'InformationCircleIcon' },
                      onClick: introDialog.setOpen,
                    },
                    {
                      id: 'upload-preset',
                      tooltip: { content: 'Upload preset from clipboard' },
                      icon: { icon: 'CloudArrowUpIcon' },
                      onClick: handleUploadPresetFromClipboard,
                      onFocus: () => setHelperIsHovered('uploadPreset'),
                      onMouseOver: () => setHelperIsHovered('uploadPreset'),
                      onBlur: () => {
                        setHelperIsHovered(null);
                      },
                      onMouseLeave: () => {
                        setHelperIsHovered(null);
                      },
                    },
                    {
                      id: 'download-preset',
                      tooltip: { content: 'Download preset' },
                      icon: { icon: 'CloudArrowDownIcon' },
                      onClick: handleDownloadPreset,
                    },
                    {
                      id: 'reset',
                      tooltip: {
                        content: 'Reset the form',
                      },
                      icon: { icon: 'TrashIcon' },
                      onClick: () => {
                        form.reset(defaultValues);
                      },
                    },
                  ]}
                />
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
          </div>

          <div className={styles.code}>
            <header className={styles.header}>
              <h3 className={styles.title}>Click the code block to copy</h3>

              <div className={styles.control}>
                <Button icon={{ icon: 'DocumentArrowDownIcon' }} onClick={handleDownloadPlugin}>
                  Download the plugin
                </Button>
              </div>
            </header>

            <pre ref={preRef} className={styles.pre}>
              {form.isInitialized && codeTemplate ? (
                <>
                  {codeTemplate.map((line, index) => (
                    <Fragment key={line + index}>
                      <code className={styles.lineNumber}>{index + 1}</code>
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </>
              ) : (
                'Loading...'
              )}

              <Button
                tooltip={{ content: 'Copy to clipboard' }}
                icon={{ icon: 'DocumentArrowDownIcon' }}
                onClick={handleCopyPresetToClipboard}
                className={styles.download}
              />
            </pre>
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
        <div className={styles.helpers}>
          <AnimatePresence mode="wait">{HELPERS?.[helperIsHovered as keyof typeof HELPERS]}</AnimatePresence>
        </div>
      </div>

      <Splash show={!form.isInitialized} delay={haveShownDialog ? 50 : 500}>
        <Spinner style={{ width: 100, height: 100, opacity: 0.5 }} />
      </Splash>
      <IntroDialog dialog={introDialog} />
    </>
  );
};

const IntroDialog = ({ dialog }: { dialog: DialogProps['dialog'] }) => {
  return (
    <Dialog dialog={dialog} title="Plugin Generator for Reaper DAW (Cockos)™">
      <p>
        This tool helps you generator JSFX plugins for Reaper DAW (Cockos)™. <br />
        Adjust the sliders to your match your needs and then download the plugin.
      </p>
      <p>Thank you for using the the JSFX Plugin Generator for Reaper</p>

      <p>
        Read more about{' '}
        <a href="https://www.reaper.fm/sdk/js/js.php" target="_blank">
          JSFX programming here
        </a>
      </p>
      <Dialog.Actions
        alignment="flex-end"
        items={[
          {
            id: 'confirm',
            label: 'Got it!',
            onClick: dialog?.setClose,
            autoFocus: true,
          },
        ]}
      />
    </Dialog>
  );
};

export type Helpers = keyof FormSchemaType['sliders'][0] | 'pluginName' | 'uploadPreset' | 'featureRequest';

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
  type: (
    <motion.p key="type" {...fadeInOut}>
      The type of the slider. Currently only <code>range</code> is supported
      <br />
    </motion.p>
  ),
  uploadPreset: (
    <motion.p key="uploadPreset" {...fadeInOut}>
      You can also drag and drop a preset anywhere on the screen to upload it
      <br />
    </motion.p>
  ),
  featureRequest: (
    <motion.p key="featureRequest" {...fadeInOut}>
      Are you experiencing troubles or have great idea for this project?
      <br />
      Feel free to submit a bug or feature request here.
    </motion.p>
  ),
} satisfies Partial<Record<Helpers, ReactNode>>;
