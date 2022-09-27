import React from 'react';
import { Helmet } from 'react-helmet';
import { trackPageView } from '../../helpers/analytics';
import { useEffect } from 'react';

export default function HeadComp({
  title = '',
  description = '',
  image = '',
  url = '',
  type = 'website',
  keywords = '',
  lang = 'en',
}) {
  useEffect(() => {
    // trackPageView(title);
  }, [title]);
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title} | Meet Kasper</title>
    </Helmet>
  );
}
