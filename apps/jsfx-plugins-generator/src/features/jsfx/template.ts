import { UseFormReturnType } from '@utils-common';

import { FormSchemaType } from '@jsfx-plugins-generator/features/jsfx/plugin';

export function useCodeTemplate(form: UseFormReturnType<FormSchemaType>): [string, string[]] {
  const _template = jsfxPluginTemplate
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

  return [_template, _template.split('\n')];
}

export const jsfxPluginTemplate = `// Automatically generated the %DATE%
// @band Kaiju (kaijurox@gmail.com) - listen https://ingrv.es/k2-h19-q
// @author Mads Thines Coello
// @version 1.1.0

desc: %PLUGIN_NAME%

slider0:0<0,15,1{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16}>MIDI Channel

cc_msg = 0xB0; // 0xB0 or CC messages

%SLIDERS%
%BLOCKS%`;

export const blockTemplate = `@init
c%SLIDER_INDEX% = ceil(slider%SLIDER_INDEX%);
c%SLIDER_INDEX%_run = 0;

@slider
c%SLIDER_INDEX% != slider%SLIDER_INDEX% ? (
  c%SLIDER_INDEX% = slider%SLIDER_INDEX%;
  c%SLIDER_INDEX%_run = 1;
);

@block
c%SLIDER_INDEX%_run ? (
  midisend(offset, (cc_msg + slider0), (%SLIDER_CC%) | (c%SLIDER_INDEX% * 256));
  c%SLIDER_INDEX%_run = 0;
);`;
