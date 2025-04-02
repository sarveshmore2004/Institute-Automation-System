import React, { useState, useMemo } from 'react';
import { FaEye, FaEdit, FaFileExport, FaCheck, FaTimes } from 'react-icons/fa';

const ApplicationsList = ({ onSelect, onView }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        date: 'all',
        search: ''
    });

    const { filteredApps, applications } = useMemo(() => {
        const mockApplications = [
            {
                id: 1,
                type: 'passport',
                studentName: 'John Doe',
                rollNo: '220103045',
                submittedDate: '2024-03-15',
                status: 'pending',
                department: 'Computer Science',
                semester: '6',
                comments: [
                    { text: 'Documents verified', date: '2024-03-16', by: 'Admin' }
                ]
            },
            {
                id: 2,
                type: 'bonafide',
                studentName: 'Jane Smith',
                rollNo: '220103046',
                submittedDate: '2024-03-14',
                status: 'approved',
                department: 'Mechanical',
                semester: '4',
                comments: [
                    { text: 'Purpose verified', date: '2024-03-14', by: 'Admin' },
                    { text: 'Approved', date: '2024-03-15', by: 'HOD' }
                ]
            },
            {
                id: 3,
                type: 'passport',
                studentName: 'Mike Johnson',
                rollNo: '220103047',
                submittedDate: '2024-03-13',
                status: 'rejected',
                department: 'Electrical',
                semester: '5',
                comments: [
                    { text: 'Missing documents', date: '2024-03-14', by: 'Admin' }
                ]
            },
            // Add more sample applications...
        ];

        const filtered = mockApplications.filter(app => {
            const matchesType = filters.type === 'all' || app.type === filters.type;
            const matchesStatus = filters.status === 'all' || app.status === filters.status;
            const matchesSearch = app.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
                                app.rollNo.includes(filters.search);
            
            return matchesType && matchesStatus && matchesSearch;
        });

        return { filteredApps: filtered, applications: mockApplications };
    }, [filters]);

    const handleBulkAction = (action) => {
        console.log(`Bulk ${action} for IDs:`, selectedItems);
        // Handle bulk actions here
    };

    const handleExport = () => {
        // Export logic here
        console.log('Exporting filtered applications:', filteredApps);
    };

    return (
        <div className="p-6">
            {/* Enhanced Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or roll number"
                            className="input input-bordered flex-1"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <select
                            className="select select-bordered"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="all">All Types</option>
                            <option value="passport">Passport</option>
                            <option value="bonafide">Bonafide</option>
                        </select>
                        <select
                            className="select select-bordered"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExport}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            <FaFileExport /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
                <div className="bg-base-200 p-4 rounded-lg mb-4 flex items-center gap-4">
                    <span className="text-sm">Selected: {selectedItems.length}</span>
                    <button 
                        onClick={() => handleBulkAction('approve')}
                        className="btn btn-success btn-sm gap-2"
                    >
                        <FaCheck /> Approve Selected
                    </button>
                    <button 
                        onClick={() => handleBulkAction('reject')}
                        className="btn btn-error btn-sm gap-2"
                    >
                        <FaTimes /> Reject Selected
                    </button>
                </div>
            )}

            {/* Enhanced Table */}
            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox"
                                    className="checkbox"
                                    onChange={(e) => {
                                        setSelectedItems(
                                            e.target.checked 
                                                ? filteredApps.map(app => app.id)
                                                : []
                                        );
                                    }}
                                />
                            </th>
                            <th>Type</th>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Department</th>
                            <th>Comments</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApps.map(app => (
                            <tr key={app.id} className="hover">
                                <td>
                                    <input 
                                        type="checkbox"
                                        className="checkbox"
                                        checked={selectedItems.includes(app.id)}
                                        onChange={(e) => {
                                            setSelectedItems(prev => 
                                                e.target.checked
                                                    ? [...prev, app.id]
                                                    : prev.filter(id => id !== app.id)
                                            );
                                        }}
                                    />
                                </td>
                                <td className="capitalize">{app.type}</td>
                                <td>{app.studentName}</td>
                                <td>{app.rollNo}</td>
                                <td>{app.submittedDate}</td>
                                <td>
                                    <span className={`badge ${
                                        app.status === 'approved' ? 'badge-success' :
                                        app.status === 'rejected' ? 'badge-error' :
                                        'badge-warning'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td>{app.department}</td>
                                <td>
                                    <div className="text-sm text-gray-600">
                                        {app.comments.length} comments
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onView(app)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <FaEye />
                                        </button>
                                        <button 
                                            onClick={() => onSelect(app)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <FaEdit />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationsList;
