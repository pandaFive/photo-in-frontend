'use client';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, styled } from '@mui/material';

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
  return (
    <Button
      component="label"
      role={undefined}
      startIcon={<CloudUploadIcon />}
      tabIndex={-1}
      variant="contained"
    >
      Upload file
      <VisuallyHiddenInput type="file" />
    </Button>
  );
};

export default UploadButton;
