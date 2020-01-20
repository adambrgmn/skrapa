import React, { useState, useEffect, useRef } from 'react';
import unfetch from 'isomorphic-unfetch';
import { FileInput } from './FileInput';
import { SheetUrl } from '../utils/sheet';
import { Response as ParseWorkbookResponse } from '../pages/api/parse-workbook';

export const WorkbookUploadForm: React.FC<Props> = ({ onUrlsExtracted }) => {
  const callbackRef = useRef(onUrlsExtracted);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<FormData | null>();

  useEffect(() => {
    callbackRef.current = onUrlsExtracted;
  }, [onUrlsExtracted]);

  useEffect(() => {
    if (!formData) return;
    const controller = new AbortController();

    unfetch('/api/parse-workbook', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
      .then(res => res.json())
      .then((data: ParseWorkbookResponse) => callbackRef.current(data.urls))
      .catch(error => {
        if (error.name === 'AbortError') console.log('aborted');
        else console.log(error);
      })
      .finally(() => handleReset());

    return () => controller.abort();
  }, [formData]);

  const handleReset = (event?: React.FormEvent<Element>) => {
    if (event) event.preventDefault();
    setFormData(null);
    setFiles(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!files) return;
    const body = new FormData();
    body.append('workbook', files[0]);
    setFormData(body);
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <label htmlFor="workbook">
        <span>Select file</span>
        <FileInput
          id="workbook"
          name="workbook"
          accept=".xls, .xlsx"
          files={files}
          onChange={event => setFiles(event.currentTarget.files)}
        />
      </label>

      <button type="submit" disabled={!files}>
        Submit
      </button>
      <button type="reset">Reset</button>
    </form>
  );
};

interface Props {
  onUrlsExtracted: (urls: SheetUrl[]) => void;
}
