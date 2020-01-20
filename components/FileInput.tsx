import React, { useState, useRef, useEffect } from 'react';

const useForceUpdate = () => {
  const [count, setCount] = useState(0);
  return () => setCount(count + 1);
};

export const FileInput: React.FC<FileInputProps> = ({
  files,
  onChange,
  ...props
}) => {
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

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

interface FileInputProps extends Omit<InputProps, 'value' | 'type'> {
  files?: FileList | null;
}
