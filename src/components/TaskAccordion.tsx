import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  AccordionSummary,
  Accordion,
  Typography,
  AccordionDetails,
  Grid,
  Paper,
} from '@mui/material';

const TaskAccordion = ({ title, body }) => {
  return (
    <Grid>
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          // height: 200,
          width: '700px',
        }}
      >
        <Accordion>
          <AccordionSummary
            aria-controls="task content"
            expandIcon={<ArrowDropDownIcon />}
            id="task header"
          >
            <Typography>{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{body}</Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  );
};

export default TaskAccordion;
