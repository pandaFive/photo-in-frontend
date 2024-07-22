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
      fullWidth
      onClose={props.toggleDialog}
      open={props.open}
    >
      <DialogTitle id="incorrect-upload-dialog-id">
        {'アップロードされたファイルの形式が正しくありません'}
      </DialogTitle>
      <DialogContent>
        <Box display={'flex'} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          {props.areaNames?.map((name) => {
            return (
              <Chip
                color="primary"
                key={name}
                label={name}
                sx={{ ml: 1, p: 0, height: '1.6rem' }}
                variant="outlined"
              />
            );
          })}
        </Box>
        <DialogContentText id="upload-file-description">
          上記いずれかの地域名の含まれたファイルのみアップロードすることができます。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.toggleDialog}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncorrectUploadDialog;
