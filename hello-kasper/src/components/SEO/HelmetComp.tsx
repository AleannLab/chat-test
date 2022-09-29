import React, { FC } from "react";
import { Helmet } from "react-helmet";

type HeadCompProps = {
  title?: string;
};

const HeadComp: FC<HeadCompProps> = ({ title }) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title} | Meet Kasper</title>
    </Helmet>
  );
};

export default HeadComp;
