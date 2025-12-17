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
      <DialogTitle id="empty-send-dialog-id" sx={{ fontWeight: 700 }}>
        ファイルがアップロードされていません
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="send-button-description">
          ファイルがアップロードされていない状態で送信することはできません。地域名が名前に含まれたファイルをアップロードしてください。
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

export default EmptySendDialog;
