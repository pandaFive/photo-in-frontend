import { AccordionDetails, Typography } from '@mui/material';
import Link from 'next/link';

type Props = {
  url: string;
  date: string;
};

const AdminDetail = (props: Props) => {
  return (
    <AccordionDetails>
      <Link href={props.url} target="_blank">
        {'Open File in New Tab'}
      </Link>
      <Typography>{`登録日時：${props.date}`}</Typography>
    </AccordionDetails>
  );
};

export default AdminDetail;
