import { useState, useEffect, useRef, useCallback } from 'react';
import PQueue, { Options } from 'p-queue/dist';

interface RequestOptions<B> extends Omit<RequestInit, 'body' | 'signal'> {
  lazy?: boolean;
  body?: B;
}

type RequestStatus<D> =
  | { status: 'initital' }
  | { status: 'loading' }
  | { status: 'resolved'; data: D }
  | { status: 'rejected'; error: any };

type UseFetchReturn<D, B> = [
  RequestStatus<D>,
  (opts?: RequestOptions<B>) => void,
];

export const createUseQueuedFetch = (
  options: Options<any, any> = { concurrency: Infinity },
) => {
  const queue = new PQueue(options);

  const useQueuedFetch = <D, B>(
    url: string,
    { lazy = false, body, ...options }: RequestOptions<B>,
  ): UseFetchReturn<D, B> => {
    const [state, setState] = useState<RequestStatus<D>>({
      status: 'initital',
    });

    const lazyRef = useRef(lazy);
    const urlRef = useRef(url);
    const optionsRef = useRef(options);
    const bodyRef = useRef(body);

    useEffect(() => {
      urlRef.current = url;
    }, [url]);

    useEffect(() => {
      optionsRef.current = options;
    }, [options]);

    useEffect(() => {
      bodyRef.current = body;
    }, [body]);

    const loadData = useCallback(
      ({ body: extraBody, ...extra }: Partial<RequestOptions<B>> = {}) => {
        const controller = new AbortController();

        const requestBody =
          extraBody || bodyRef.current
            ? JSON.stringify(extraBody ?? bodyRef.current)
            : undefined;

        queue
          .add(() =>
            fetch(urlRef.current, {
              ...optionsRef.current,
              ...extra,
              signal: controller.signal,
              body: requestBody,
            }),
          )
          .then(r => r.json())
          .then((data: D) => setState({ status: 'resolved', data }))
          .catch(error => {
            if (error.name !== 'AbortError') {
              setState({ status: 'rejected', error });
            }
          });

        setState({ status: 'loading' });
        return () => controller.abort();
      },
      [],
    );

    useEffect(() => {
      if (!lazyRef.current && state.status === 'initital') {
        return loadData();
      }
    }, [loadData, state.status]);

    return [state, loadData];
  };

  return useQueuedFetch;
};

export const useFetch = createUseQueuedFetch();
