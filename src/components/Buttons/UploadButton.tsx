'use client';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Box } from '@mui/material';
import React, { useMemo, useState, useRef } from 'react';

import EmptySendDialog from '../EmptySendDialog';
import IncorrectUploadDialog from '../IncorrectUploadDialog';

type Props = {
  areaNames: string[];
};

const UploadButton = (props: Props) => {
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const toggledSendOpen = () => {
    setSendDialogOpen(!sendDialogOpen);
  };

  const [incorrectDialogOpen, setIncorrectDialogOpen] = useState(false);
  const toggleIncorrectOpen = () => {
    setIncorrectDialogOpen(!incorrectDialogOpen);
  };

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
    const filteredFileArray = newFileArray.filter((file) =>
      props.areaNames.some((area) => file.name.includes(area)),
    );
    const dt = new DataTransfer();
    filteredFileArray.forEach((file) => dt.items.add(file));
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));

    // newFileArray と filteredFileArrayの長さが異なるときに無効であるというmessageを表示する
    if (newFileArray.length !== filteredFileArray.length) {
      toggleIncorrectOpen();
    }
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

    if (file.name === 'foo.txt') {
      toggledSendOpen();
    } else {
      const formData = new FormData();
      formData.append('file', file);

      await fetch(`/api/aws`, {
        method: 'POST',
        body: formData,
      });
    }
    const dt = new DataTransfer();
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));
  };

  const onSend = () => {
    sendData()
      .then()
      .catch((e) => console.error(e));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        component="label"
        role={undefined}
        startIcon={<CloudUploadIcon />}
        tabIndex={-1}
        variant="contained"
      >
        Upload file
        <input
          className="visuallyHiddenInput"
          multiple
          onChange={changeUploadFile}
          ref={inputFileRef}
          type="file"
        />
      </Button>
      <IncorrectUploadDialog
        areaNames={props.areaNames}
        open={incorrectDialogOpen}
        toggleDialog={toggleIncorrectOpen}
      />
      <Button onClick={onSend} sx={{ ml: 1 }} variant="contained">
        送信
      </Button>
      <EmptySendDialog open={sendDialogOpen} toggleDialog={toggledSendOpen} />
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
    </Box>
  );
};

export default UploadButton;
