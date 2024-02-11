import { Form, UseFormReturnType } from '@utils-common';
import { UseFieldArrayReturn, useFieldArray } from 'react-hook-form';

import { blockTemplate, jsfxPluginTemplate } from '@jsfx-plugins-generator/jsfx/plugin.template';

import styles from './plugin.module.scss';

export type SliderProps = {
  /**
   * min: 0
   * max: 127
   */
  minValue: 0;
  /**
   * min: 0
   * max: 127
   */
  maxValue: 127;
  /**
   * min: 0
   * max: 127
   */
  defaultValue: 64;
  /**
   * min: 0
   * max: 127
   */
  cc: 1;
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
      defaultValue: 64,
      maxValue: 127,
      minValue: 0,
      name: '',
      type: 'range',
    },
  ],
};

export const SliderForm = () => {
  const form = Form.useForm<SliderFormValues>({ defaultValues });

  const fieldArray = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'sliders', // unique name for your Field Array,
  });

  const onSubmit = (data: SliderFormValues) => console.log(data);

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
      form.watch('sliders').reduce((acc, slider, index) => {
        return `${acc}slider${index + 1}:${slider.defaultValue}<${slider.minValue},${slider.maxValue},1>${
          slider.name
        } (${slider.cc})\n`;
      }, '')
    )
    .replace(
      /%BLOCKS%/,
      form.watch('sliders').reduce((acc, slider, index) => {
        return `${acc}${blockTemplate
          .replace(/%SLIDER_INDEX%/g, (index + 1).toString())
          .replace(/%SLIDER_CC%/g, slider.cc.toString())}\n`;
      }, '')
    );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.fields}>
        <fieldset className={styles.info}>
          <legend>Plugin information</legend>
          <label>
            Name
            <input placeholder={'Plugin name'} className={styles.input} {...form?.register('name')} />
          </label>

          <div className={styles.control}>
            <button type="button">Upload</button>
          </div>
        </fieldset>
        <fieldset className={styles.sliders}>
          <legend>Sliders</legend>
          {fieldArray.fields.map((field, index) => (
            <SliderField
              key={field.id} // important to include key with field's id
              index={index}
              form={form}
              fieldArray={fieldArray}
              {...field}
            />
          ))}
        </fieldset>
      </div>

      <div className={styles.code}>
        <h3>Click the code block to copy</h3>
        <pre
          className={styles.pre}
          onClick={event => {
            const { textContent } = event.target as HTMLElement;

            if (!textContent) {
              return;
            }

            navigator.clipboard.writeText(textContent);
          }}
        >
          {template}
        </pre>
      </div>
      {/* <input type="submit" /> */}
    </form>
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
  form: UseFormReturnType<SliderFormValues, any>;
  fieldArray: UseFieldArrayReturn<SliderFormValues, 'sliders', 'id'>;
}) => {
  return (
    <div className={styles.slider}>
      <input
        key={id} // important to include key with field's id
        placeholder={name || 'Slider name'}
        className={styles.input}
        {...form?.register(`sliders.${index}.name`)}
      />

      <div className={styles.control}>
        <button type="button" disabled={index === 0} onClick={() => fieldArray.move(index, index - 1)}>
          ↥
        </button>
        <button
          type="button"
          disabled={fieldArray.fields.length === index + 1}
          onClick={() => fieldArray.move(index, index + 1)}
        >
          ↧
        </button>
        <button type="button" onClick={() => fieldArray.insert(index + 1, { ...sliderDefault, name: '' })}>
          +
        </button>
      </div>
    </div>
  );
};
