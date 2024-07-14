import { Button } from '@mui/material';

type Props = {
  onClick: () => void;
  str: string;
};

export const BasicButton = (props: Props) => {
  return (
    <Button
      onClick={props.onClick}
      sx={{ m: 1 }}
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
      sx={{ m: 1 }}
      tabIndex={-1}
      variant="outlined"
    >
      {props.str}
    </Button>
  );
};
