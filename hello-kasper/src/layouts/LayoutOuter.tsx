import React, { FC, FunctionComponent } from "react";

type LayoutOuterProps = {
  content: FunctionComponent;
};

const LayoutOuter: FC<LayoutOuterProps> = ({ content: Content }) => {
  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      <div className="px-4">
        <Content />
      </div>
    </div>
  );
};
export default LayoutOuter;
