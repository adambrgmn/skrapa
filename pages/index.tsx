import React, { useState } from 'react';
import { NextPage } from 'next';
import { WorkbookUploadForm, Urls } from '../components/WorkbookUploadForm';
import { UrlTable } from '../components/UrlTable';

const IndexPage: NextPage = () => {
  const [urls, setUrls] = useState<Urls[]>([]);

  return (
    <React.Fragment>
      <WorkbookUploadForm onUrlsExtracted={setUrls} />
      <UrlTable
        urls={process.env.NODE_ENV === 'development' ? urls.slice(0, 5) : urls}
      />
    </React.Fragment>
  );
};

export default IndexPage;
