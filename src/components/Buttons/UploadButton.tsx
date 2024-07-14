'use client';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, styled, Box } from '@mui/material';
import React, { useMemo, useState, useRef } from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = () => {
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const selectedFileArray: File[] = useMemo(() => {
    return inputFiles ? [...Array.from(inputFiles)] : [];
  }, [inputFiles]);

  const changeUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target: HTMLInputElement = event.target;
    const files: FileList = target.files ? target.files : new FileList();

    if (!files) return;
    if (!inputFileRef.current?.files) return;
    const newFileArray = [...selectedFileArray, ...Array.from(files)].filter(
      (file, index, self) =>
        self.findIndex((f) => f.name === file.name) === index,
    );
    const dt = new DataTransfer();
    newFileArray.forEach((file) => dt.items.add(file));
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));
  };

  const handleDelete = (index: number) => {
    if (!inputFileRef.current?.files) return;
    const dt = new DataTransfer();
    selectedFileArray.forEach((file, i) => i !== index && dt.items.add(file));
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));
  };

  const sendData = async (): Promise<void> => {
    if (!inputFileRef.current?.files) {
      throw new Error('No file selected');
    }

    const file: File = inputFileRef.current.files[0]
      ? inputFileRef.current.files[0]
      : new File(['foo'], 'foo.txt');

    const formData = new FormData();
    formData.append('file', file);

    await fetch(`/api/aws`, {
      method: 'POST',
      body: formData,
    });
    const dt = new DataTransfer();
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));
  };

  const onSend = () => {
    sendData()
      .then()
      .catch((e) => alert(e));
  };

  return (
    <Box>
      <Button
        component="label"
        role={undefined}
        // onChange={changeUploadFile}
        startIcon={<CloudUploadIcon />}
        tabIndex={-1}
        variant="contained"
      >
        Upload file
        <VisuallyHiddenInput
          multiple
          onChange={changeUploadFile}
          ref={inputFileRef}
          type="file"
        />
      </Button>
      <div>
        {selectedFileArray.map((file, index) => (
          <div key={file.name}>
            <div>{file.name}</div>
            <Button onClick={() => handleDelete(index)} variant="outlined">
              削除
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={onSend} variant="contained">
        送信
      </Button>
    </Box>
  );
};

export default UploadButton;
