export const jsfxPluginTemplate = `// Automatically generated the %DATE%
// @author mthines (madsthines@gmail.com)
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
