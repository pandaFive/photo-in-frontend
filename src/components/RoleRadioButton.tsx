'use client';

import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';

const RoleRadioButton = () => {
  const [value, setValue] = useState('member');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <RadioGroup name="role" onChange={handleChange} row value={value}>
      <FormControlLabel control={<Radio />} label="Member" value="member" />
      <FormControlLabel control={<Radio />} label="Admin" value="admin" />
    </RadioGroup>
  );
};

export default RoleRadioButton;
