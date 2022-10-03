import React, { useState } from 'react';
import CropImage from '.';

export default {
  title: 'Crop Image',
  component: CropImage,
};

export const Main = () => {
  const [imgSrc, setImgSrc] = useState('');

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  const onCropComplete = (blob) => {
    console.log(blob);
    // new File([blob])
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = blob.name;
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      <CropImage imgSrc={imgSrc} showPreview={true} onCrop={onCropComplete} />
    </div>
  );
};
