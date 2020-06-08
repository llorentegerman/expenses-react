import React from 'react';
import DatePicker from 'react-datepicker';
import { InputComponent } from '../';
import 'react-datepicker/dist/react-datepicker.css';

function DatePickerComponent({ selected, onChange, value, ...otherProps }) {
    return (
        <DatePicker
            name="date"
            selected={selected}
            onChange={onChange}
            dateFormat="dd/MM/yyyy"
            customInput={<InputComponent value={value} />}
            {...otherProps}
        />
    );
}

export default DatePickerComponent;
