import React, { useState } from 'react';
import { FaTimesCircle, FaEye } from 'react-icons/fa';

const ApplicationDetails = ({ application, onClose, onViewFull }) => {
    const [newComment, setNewComment] = useState('');
    const [status, setStatus] = useState(application.status);

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        // Add API call here
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        // Add API call here
        setNewComment('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-base-100 border-b border-base-200 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Manage Application</h2>
                        <p className="text-sm text-gray-500">#{application.id}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onViewFull}
                            className="btn btn-ghost btn-sm"
                            title="View Full Application"
                        >
                            <FaEye />
                        </button>
                        <button 
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            <FaTimesCircle />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-base-100 p-4 rounded-lg border border-base-200">
                        <InfoField label="Student" value={application.studentName} />
                        <InfoField label="Type" value={application.type} />
                        <InfoField label="Status" value={status} />
                        <InfoField label="Submitted" value={application.submittedDate} />
                        <InfoField label="Department" value={application.department} />
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Comments</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto p-4 bg-base-100 rounded-lg border border-base-200">
                            {application.comments.map((comment, index) => (
                                <div key={index} className="bg-base-200 p-3 rounded-lg">
                                    <p className="text-sm">{comment.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {comment.date} by {comment.by}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="input input-bordered flex-1"
                                placeholder="Add a comment..."
                            />
                            <button 
                                onClick={handleAddComment}
                                className="btn btn-primary"
                                disabled={!newComment.trim()}
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-4 flex justify-end gap-3">
                    <button 
                        onClick={() => handleStatusChange('rejected')}
                        className="btn btn-error"
                        disabled={status === 'rejected'}
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => handleStatusChange('approved')}
                        className="btn btn-success"
                        disabled={status === 'approved'}
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium capitalize">{value}</p>
    </div>
);

export default ApplicationDetails;
