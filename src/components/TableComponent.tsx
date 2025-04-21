export default function TableComponent({ result }: { result: any }) {
    if (!result || result.length === 0) {
        return <div className="text-gray-500 italic">No data to display</div>;
    }

    const headers = Object.keys(result[0]);
    return (
        <table className="min-w-full text-sm text-left table-auto border-collapse">
            <thead className="bg-[#e3ebfa]">
                <tr>
                    {
                        headers.map((header, index) => {
                            return (
                                <th key={index} className="text-[#25265E] p-2 font-normal text-xs border">{header}</th>
                            )
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {result.map((row: any, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                        {headers.map((header) => (
                            <td key={header} className="text-[#25265E] border p-2 font-euclidCircular font-normal text-xs">
                                {String(row[header])}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}