import React, { useState, useEffect } from 'react';
import PQueue from 'p-queue';
import { SheetUrl } from '../utils/sheet';
import {
  Body as ExtractSelectorBody,
  Response as ExtractSelectorResponse,
} from '../pages/api/extract-selector';

const queue = new PQueue({ concurrency: 2 });

const TableRow: React.FC<TableRowProps> = ({ url, title, generalSelector }) => {
  const [selector, setSelector] = useState(generalSelector);
  const [hasUpdatedSelector, setHasUpdatedSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('');

  useEffect(() => {
    if (!hasUpdatedSelector) setSelector(generalSelector);
  }, [generalSelector, hasUpdatedSelector]);

  useEffect(() => {
    if (!url || !selector) return;

    setLoading(true);

    const controller = new AbortController();
    const body: ExtractSelectorBody = { url, selector };

    queue
      .add(() =>
        fetch('/api/extract-selector', {
          method: 'POST',
          body: JSON.stringify(body),
          signal: controller.signal,
        }),
      )
      .then(r => r.json())
      .then((data: ExtractSelectorResponse) => setData(data.content))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url, selector]);

  const handleSelectorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelector(event.currentTarget.value);
    setHasUpdatedSelector(true);
  };

  return (
    <tr>
      <th scope="row">{title ?? '-'}</th>
      <td>{url}</td>
      <td>{loading ? 'Loading...' : data.length < 1 ? 'Waiting' : data}</td>
      <td>
        <label htmlFor={'selector-' + url}>
          <input
            type="text"
            id={'selector-' + url}
            name="selector"
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
          {urls.map(({ title, url }) => (
            <TableRow
              key={url}
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
  urls: SheetUrl[];
}
