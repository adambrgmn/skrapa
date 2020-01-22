import React, { useState, useEffect } from 'react';
import {
  Body as ExtractSelectorBody,
  Response as ExtractSelectorResponse,
} from '../pages/api/extract-selector';
import { Urls } from './WorkbookUploadForm';
import { createUseQueuedFetch } from '../hooks/useFetch';

const useQueuedFetch = createUseQueuedFetch({ concurrency: 2 });

const TableRow: React.FC<TableRowProps> = ({ url, title, generalSelector }) => {
  const [selector, setSelector] = useState('');

  const [state, load] = useQueuedFetch<
    ExtractSelectorResponse,
    ExtractSelectorBody
  >('/api/extract-selector', {
    lazy: true,
    method: 'POST',
    body: { url, selector: selector || generalSelector },
  });

  useEffect(() => {
    if (selector.length > 0 || generalSelector.length > 0) load();
  }, [selector, generalSelector, load]);

  const handleSelectorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelector(event.currentTarget.value);
  };

  return (
    <tr>
      <th scope="row">{title ?? '-'}</th>
      <td>{url}</td>
      <td>
        {state.status === 'initital' && '...'}
        {state.status === 'loading' && 'Loading...'}
        {state.status === 'rejected' && 'Error: ' + state.error.message}
        {state.status === 'resolved' && state.data.content}
      </td>
      <td>
        <label htmlFor={'selector-' + url}>
          <input
            type="text"
            id={'selector-' + url}
            name="selector"
            placeholder={generalSelector}
            value={selector}
            onChange={handleSelectorChange}
          />
        </label>
      </td>
    </tr>
  );
};

interface TableRowProps {
  url: string;
  title: string | null;
  generalSelector: string;
}

export const UrlTable: React.FC<Props> = ({ urls }) => {
  const [proxySelector, setProxySelector] = useState('');
  const [selector, setSelector] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSelector(proxySelector);
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <label htmlFor="general-selector">
          <span>General selector:</span>
          <input
            type="text"
            name="general-selector"
            id="general-selector"
            value={proxySelector}
            onChange={event => setProxySelector(event.currentTarget.value)}
          />
        </label>

        <button type="submit">Update selector</button>
      </form>
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Url</th>
            <th scope="col">Data</th>
            <th scope="col">Custom Selector</th>
          </tr>
        </thead>

        <tbody>
          {urls.map(({ id, title, url }) => (
            <TableRow
              key={id}
              url={url}
              title={title}
              generalSelector={selector}
            />
          ))}
          <tr>
            <th scope="row"></th>
          </tr>
        </tbody>
      </table>
    </React.Fragment>
  );
};

interface Props {
  urls: Urls[];
}
