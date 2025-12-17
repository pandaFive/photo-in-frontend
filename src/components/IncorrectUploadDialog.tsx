import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

type Props = {
  toggleDialog: () => void;
  open: boolean;
  areaNames: string[];
};

const IncorrectUploadDialog = (props: Props) => {
  return (
    <Dialog
      aria-describedby="incorrect-upload-dialog"
      aria-labelledby="incorrect-upload-dialog"
      maxWidth="sm"
      onClose={props.toggleDialog}
      open={props.open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle id="incorrect-upload-dialog-id" sx={{ fontWeight: 700 }}>
        アップロードされたファイルの形式が正しくありません
      </DialogTitle>
      <DialogContent>
        <Box display={'flex'} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          {props.areaNames?.map((name) => {
            return (
              <Chip
                key={name}
                label={name}
                sx={{
                  ml: 1,
                  p: 0,
                  height: '1.6rem',
                  borderColor: '#667eea',
                  color: '#667eea',
                }}
                variant="outlined"
              />
            );
          })}
        </Box>
        <DialogContentText id="upload-file-description">
          上記いずれかの地域名の含まれたファイルのみアップロードすることができます。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={props.toggleDialog}
          sx={{
            borderRadius: 2,
            bgcolor: '#667eea',
            color: 'white',
            px: 3,
            '&:hover': {
              bgcolor: '#5a6fd6',
            },
          }}
          variant="contained"
        >
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncorrectUploadDialog;
