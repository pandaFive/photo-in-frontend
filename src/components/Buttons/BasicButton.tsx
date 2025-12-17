import { Button } from '@mui/material';

type Props = {
  onClick: () => void;
  str: string;
};

export const BasicButton = (props: Props) => {
  return (
    <Button
      onClick={props.onClick}
      sx={{
        m: 1,
        borderRadius: 2,
        bgcolor: '#667eea',
        '&:hover': {
          bgcolor: '#5a6fd6',
        },
      }}
      tabIndex={-1}
      variant="contained"
    >
      {props.str}
    </Button>
  );
};

export const OutlinedButton = (props: Props) => {
  return (
    <Button
      onClick={props.onClick}
      sx={{
        m: 1,
        borderRadius: 2,
        borderColor: '#667eea',
        color: '#667eea',
        '&:hover': {
          borderColor: '#5a6fd6',
          bgcolor: 'rgba(102, 126, 234, 0.04)',
        },
      }}
      tabIndex={-1}
      variant="outlined"
    >
      {props.str}
    </Button>
  );
};
