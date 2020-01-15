import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import unfetch from 'isomorphic-unfetch';

const useForceUpdate = () => {
  const [count, setCount] = useState(0);
  return () => setCount(count + 1);
};

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
interface FileInputProps extends Omit<InputProps, 'value' | 'type'> {
  files?: FileList | null;
}

const FileInput: React.FC<FileInputProps> = ({ files, onChange, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!ref.current) return;
    if (!files) ref.current.value = '';
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    forceUpdate();
    if (onChange) onChange(event);
  };

  return <input ref={ref} type="file" onChange={handleChange} {...props} />;
};

const IndexPage: NextPage = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<FormData | null>();

  const reset = (event?: React.FormEvent<Element>) => {
    if (event) event.preventDefault();
    setFormData(null);
    setFiles(null);
  };

  useEffect(() => {
    if (!formData) return;
    const controller = new AbortController();

    unfetch('/api/parse-workbook', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(error => {
        if (error.name === 'AbortError') console.log('aborted');
        else console.log(error);
      })
      .finally(() => reset());

    return () => controller.abort();
  }, [formData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!files) return;
    const body = new FormData();
    body.append('workbook', files[0]);
    setFormData(body);
  };

  return (
    <form onSubmit={handleSubmit} onReset={reset}>
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

export default IndexPage;
