import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';

const DateTimePicker = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleStartDateChange = (date) => {
        const convertedDate = moment(date).tz('Asia/Jerusalem').format('YYYY-MM-DDTHH:mm:ssZ');
        setStartDate(date);
        onDateChange({ startDate: convertedDate, endDate: moment(endDate).tz('Asia/Jerusalem').format('YYYY-MM-DDTHH:mm:ssZ') });
    };

    const handleEndDateChange = (date) => {
        const convertedDate = moment(date).tz('Asia/Jerusalem').format('YYYY-MM-DDTHH:mm:ssZ');
        setEndDate(date);
        onDateChange({ startDate: moment(startDate).tz('Asia/Jerusalem').format('YYYY-MM-DDTHH:mm:ssZ'), endDate: convertedDate });
    };

    return (
        <div>
            <div>
                <label>Start Time:</label>
                <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="yyyy-MM-dd HH:mm"
                />
            </div>
            <div>
                <label>End Time:</label>
                <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="yyyy-MM-dd HH:mm"
                />
            </div>
        </div>
    );
};

export default DateTimePicker;
