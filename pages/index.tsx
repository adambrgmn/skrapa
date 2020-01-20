import React, { useState } from 'react';
import { NextPage } from 'next';
import { WorkbookUploadForm } from '../components/WorkbookUploadForm';
import { SheetUrl } from '../utils/sheet';
import { UrlTable } from '../components/UrlTable';
import { unique } from '../utils/array';

const IndexPage: NextPage = () => {
  const [urls, setUrls] = useState<SheetUrl[]>([]);

  return (
    <React.Fragment>
      <WorkbookUploadForm onUrlsExtracted={setUrls} />
      <UrlTable urls={unique(urls, ({ url }) => url).slice(0, 5)} />
    </React.Fragment>
  );
};

export default IndexPage;
