import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

type Props = {
  toggleDialog: () => void;
  open: boolean;
};

const EmptySendDialog = (props: Props) => {
  return (
    <Dialog
      aria-describedby="empty-send-dialog"
      aria-labelledby="empty-send-dialog"
      fullWidth
      onClose={props.toggleDialog}
      open={props.open}
    >
      <DialogTitle id="empty-send-dialog-id">
        {'ファイルがアップロードされていません'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="send-button-description">
          ファイルがアップロードされていない状態で送信することはできません。地域名が名前に含まれたファイルをアップロードしてください。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.toggleDialog}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmptySendDialog;
