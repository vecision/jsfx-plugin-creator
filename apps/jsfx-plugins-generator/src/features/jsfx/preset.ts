import { toMemoKey, UseFormReturnType } from '@utils-common';
import saveAs from 'file-saver';
import { useCallback } from 'react';

import { useToast } from '@jsfx-plugins-generator/components/toast/toast';

import { FormSchemaType } from '@jsfx-plugins-generator/features/jsfx/plugin';

export function usePreset(form: UseFormReturnType<FormSchemaType>) {
  const toast = useToast();

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
