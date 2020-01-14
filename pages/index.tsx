import React, { useEffect } from 'react';
import { NextPage } from 'next';
import unfetch from 'isomorphic-unfetch';

const IndexPage: NextPage = () => {
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await unfetch('/api/parse', { signal: controller.signal });
        const json = await res.json();

        console.log(json);
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <h2>hello world</h2>;
};

export default IndexPage;
