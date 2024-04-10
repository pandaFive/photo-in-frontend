import Typography from '@mui/material/Typography';
import * as React from 'react';

interface TitleProps {
  children?: React.ReactNode;
}

export default function Title(props: TitleProps) {
  return (
    <Typography color="primary" component="h2" gutterBottom variant="h6">
      {props.children}
    </Typography>
  );
}
