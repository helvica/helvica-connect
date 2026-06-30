export function exportToCsv(filename, rows) {
    if (!rows || !rows.length) {
        return;
    }

    // Determine CSV headers based on the keys of the first object
    const headers = Object.keys(rows[0]);

    // Format the CSV string
    const csvContent = [
        headers.join(','), // Header row
        ...rows.map(row => 
            headers.map(header => {
                const value = row[header] === null || row[header] === undefined ? '' : row[header];
                // Escape quotes and wrap in quotes if there's a comma
                let strValue = String(value);
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    strValue = `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',')
        )
    ].join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
