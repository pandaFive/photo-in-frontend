'use client';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Box } from '@mui/material';
import React, { useState, useRef, useCallback } from 'react';

import EmptySendDialog from '@/src/components/EmptySendDialog';
import IncorrectUploadDialog from '@/src/components/IncorrectUploadDialog';
import { useToast } from '@/src/context/ToastContext';
import { useFileUpload } from '@/src/mutations';

type Props = {
  areaNames: string[];
};

const UploadButton = (props: Props) => {
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading } = useFileUpload();
  const { showSuccess, showErrorWithRetry } = useToast();

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const toggledSendOpen = useCallback(() => {
    setSendDialogOpen((prev) => !prev);
  }, []);

  const [incorrectDialogOpen, setIncorrectDialogOpen] = useState(false);
  const toggleIncorrectOpen = useCallback(() => {
    setIncorrectDialogOpen((prev) => !prev);
  }, []);

  const changeUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target: HTMLInputElement = event.target;
    const files: FileList = target.files ? target.files : new FileList();

    if (!files || !inputFileRef.current?.files) return;

    // Setを使用して重複チェックをO(n)に最適化
    const fileNameSet = new Set<string>();
    const uniqueFiles: File[] = [];

    // 既存ファイル
    inputFiles.forEach((file) => {
      if (!fileNameSet.has(file.name)) {
        fileNameSet.add(file.name);
        uniqueFiles.push(file);
      }
    });

    // 新規ファイル
    Array.from(files).forEach((file) => {
      if (!fileNameSet.has(file.name)) {
        fileNameSet.add(file.name);
        uniqueFiles.push(file);
      }
    });

    // エリア名フィルタリング - Setで高速化
    const areaNameSet = new Set(props.areaNames);
    const filteredFiles = uniqueFiles.filter((file) =>
      Array.from(areaNameSet).some((area) => file.name.includes(area))
    );

    const dt = new DataTransfer();
    filteredFiles.forEach((file) => dt.items.add(file));
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));

    // 無効なファイルがあった場合にメッセージを表示
    if (uniqueFiles.length !== filteredFiles.length) {
      toggleIncorrectOpen();
    }
  };

  const selectedFileArray = inputFiles;

  const handleDelete = (index: number) => {
    if (!inputFileRef.current?.files) return;
    const dt = new DataTransfer();
    selectedFileArray.forEach((file, i) => i !== index && dt.items.add(file));
    inputFileRef.current.files = dt.files;
    setInputFiles(Array.from(dt.files));
  };

  const clearFiles = useCallback(() => {
    if (inputFileRef.current) {
      const dt = new DataTransfer();
      inputFileRef.current.files = dt.files;
      setInputFiles(Array.from(dt.files));
    }
  }, []);

  const onSend = useCallback(async () => {
    if (!inputFileRef.current?.files || inputFileRef.current.files.length === 0) {
      toggledSendOpen();
      return;
    }

    const files = Array.from(inputFileRef.current.files);
    const result = await uploadFiles(files);

    if (result.success) {
      clearFiles();
      showSuccess('ファイルをアップロードしました');
    } else {
      console.error('Upload failed:', result.error);
      showErrorWithRetry(
        result.error ?? 'アップロードに失敗しました',
        () => void onSend(),
      );
    }
  }, [uploadFiles, clearFiles, showSuccess, showErrorWithRetry, toggledSendOpen]);

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
      <Button
        disabled={isUploading}
        onClick={() => void onSend()}
        sx={{ ml: 1 }}
        variant="contained"
      >
        {isUploading ? 'アップロード中...' : '送信'}
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
