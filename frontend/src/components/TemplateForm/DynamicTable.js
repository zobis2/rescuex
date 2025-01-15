import React, { useState, useEffect } from 'react';

// Constants for the table columns and options
const TABLE_COLUMNS = [
    'רכיב תורם נגר',
    'גודל',
    'אחוז מהשטח',
    'מקדם נגר',
    'נפח מצטבר ב1:5',
    'נפח מצטבר ב1:50',
];

const OPTIONS = [
    { name: 'גגות ומרפסות', coefficient: 0.9 },
    { name: 'גינון כללי', coefficient: 0.3 },
    { name: 'גינון כללי מעל מרתף', coefficient: 0.4 },
    { name: 'רמפות ירידה למרת', coefficient: 0.8 },
    { name: 'ריצוף לא מחלחל', coefficient: 0.7 },
    { name: 'ריצוף מחלחל מעל מרתף', coefficient: 0.5 },
    { name: 'ריצוף מחלחל מעל ק טבעית', coefficient: 0.6 },
];

const DynamicTable = ({ project, onTableChange, onTotalChange }) => {
    const [tableData, setTableData] = useState([]);
    const [totalData,setTotalData] = useState({
        name: "סה״כ",
        size: 0,
        coefficient: "",
        percentage: "100",
        cumulativeVolume1to5: 0,
        cumulativeVolume1to50: 0
    });
    useEffect(() => {
        // Initialize table data with all options on load
        const initialData = OPTIONS.map(option => ({
            name: option.name,
            size: 0,
            coefficient: option.coefficient,
            percentage: 0,
            cumulativeVolume1to5: 0,
            cumulativeVolume1to50: 0,
        }));
        setTableData(initialData);
    }, []);

    function updateTableAndTotals(updatedTable) {
        // Recalculate percentages and cumulative volumes
        const totalSize = updatedTable.reduce((sum, row) => sum + row.size, 0);

        updatedTable.forEach(row => {
            // debugger;
            row.percentage = ((row.size / totalSize) * 100).toFixed(2);
            row.cumulativeVolume1to5 = (
                row.size * row.coefficient * project.rainflow1to5
            ).toFixed(2);

            // Apply rainfall1to50 calculation only for 'גגות ומרפסות'
            row.cumulativeVolume1to50 =
                row.name === 'גגות ומרפסות'
                    ? (row.size * row.coefficient * project.rainflow1to50).toFixed(2)
                    : ''
        });
        // debugger;

        const totalPercentage = tableData.reduce((sum, row) => sum + parseFloat(row.percentage), 0).toFixed(0);
        const totalRainfall1to5 = tableData
            .reduce((sum, row) => sum + (isNaN(parseFloat(row.cumulativeVolume1to5)) ? 0 : parseFloat(row.cumulativeVolume1to5)), 0)
            .toFixed(2);

        const totalRainfall1to50 = tableData
            .reduce((sum, row) => sum + (isNaN(parseFloat(row.cumulativeVolume1to50)) ? 0 : parseFloat(row.cumulativeVolume1to50)), 0)
            .toFixed(2);
        const totalData = {
            totalSize,
            totalRainfall1to5,
            totalRainfall1to50,
            totalPercentage,
        };
        setTotalData(totalData);
        onTotalChange(totalData);
        setTableData(updatedTable);
        onTableChange(updatedTable); // Pass updated table to parent
    }

    const handleInputChange = (index, field, value) => {
        const updatedTable = [...tableData];
        updatedTable[index][field] = parseFloat(value) || 0;
        updateTableAndTotals(updatedTable);
    };

    const handleDeleteRow = (index) => {
        const updatedTable = tableData.filter((_, i) => i !== index);

        updateTableAndTotals(updatedTable);

    };

    const { totalSize,
        totalRainfall1to5,
        totalRainfall1to50,
        totalPercentage,}=totalData;
    // onTableChange(tableData,totalData)
    return (
        <div className="container" style={{direction: 'rtl'}}>
            <h2>טבלת נגר</h2>

            <table border="1" style={{marginTop: '10px', width: '100%'}}>
                <thead>
                <tr>
                    {TABLE_COLUMNS.slice().map((col) => (
                        <th key={col}>{col}</th>
                    ))}
                    <th>פעולה</th>
                </tr>
                </thead>
                <tbody>
                {tableData.map((row, index) => (
                    <tr key={index}>
                        {[
                            row.name,
                            <input
                                key={`size-${index}`}
                                type="text"
                                value={row.size}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow only digits without leading zeros
                                    if (/^\d*$/.test(value)) {
                                        const sanitizedValue = value.replace(/^0+(?=\d)/, '');
                                        handleInputChange(index, 'size', sanitizedValue);
                                    }
                                }}
                            />,
                            row.percentage + '%',
                            row.coefficient,
                            row.cumulativeVolume1to5,
                            row.cumulativeVolume1to50,


                            ,
                        ].map((cell, i) => (
                            <td key={i}>{cell}</td>
                        ))}
                        <td>
                            <button onClick={() => handleDeleteRow(index)}>מחק שורה</button>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td>סה״כ</td>
                    <td>{totalSize}</td>
                    <td>{totalPercentage}%</td>
                    <td colSpan="1"></td>

                    <td>{totalRainfall1to5}</td>
                    <td>{totalRainfall1to50}</td>


                    {/* Empty cells to align with reversed order */}


                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
