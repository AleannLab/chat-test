import React from 'react';
import { Helmet } from 'react-helmet';

export default function HeadComp({
  title = '',
  description = '',
  image = '',
  url = '',
  type = 'website',
  keywords = '',
  lang = 'en',
}) {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title} | Meet Kasper</title>
    </Helmet>
  );
}
