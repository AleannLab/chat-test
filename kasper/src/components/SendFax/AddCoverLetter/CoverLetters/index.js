import React, { useEffect, useRef, useState } from 'react';
import { ButtonBase, FormControl, RadioGroup } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { CheckCircle } from '@material-ui/icons';

const CustomRadio = ({ imgURL, checked, ...props }) => {
  return (
    <ButtonBase
      style={{ borderRadius: 4, height: 175, width: 130, position: 'relative' }}
      {...props}
    >
      <img
        style={{
          opacity: checked ? 1 : 0.5,
          border: checked ? '1px solid #F4266E' : '1px solid #999999',
          borderRadius: 4,
        }}
        height={175}
        width={130}
        src={imgURL}
      />
      {checked && (
        <CheckCircle
          color="#F4266E"
          style={{ position: 'absolute', top: 5, right: 5, color: '#F4266E' }}
        />
      )}
    </ButtonBase>
  );
};

const LoadingSkeleton = () => {
  return (
    <Skeleton
      style={{ borderRadius: 4 }}
      variant="rect"
      animation="wave"
      height={175}
      width={130}
    />
  );
};

const CoverLetters = ({ value, coverLetters, onChange }) => {
  return (
    <>
      <div className="w-100 d-flex" style={{ justifyContent: 'space-between' }}>
        <label
          style={{ fontSize: 11, color: 'rgba(0, 0, 0, 0.54)' }}
          className="my-2"
        >
          TEMPLATE
        </label>
      </div>

      <div
        className="p-3"
        style={{ border: '1px solid #999', borderRadius: 4 }}
      >
        <FormControl>
          <RadioGroup
            style={{ gap: 12 }}
            className="flex-row"
            value={value}
            onChange={onChange}
          >
            {!coverLetters.length ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : (
              coverLetters?.map((coverPage) => (
                <CustomRadio
                  key={coverPage.uuid}
                  onClick={() => {
                    onChange(coverPage.uuid);
                  }}
                  checked={coverPage.uuid === value}
                  imgURL={coverPage.previewLink}
                />
              ))
            )}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};

export default CoverLetters;
