import React from 'react';
import { FaTimesCircle, FaEdit } from 'react-icons/fa';

const ViewApplication = ({ application, onClose, onManage }) => {
    const renderPassportApplication = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <InfoField label="Application Type" value="Passport" />
                <InfoField label="Mode" value={application.mode} />
                <InfoField label="Place of Birth" value={application.placeOfBirth} />
                <InfoField label="Current Semester" value={application.semester} />
                {application.mode === 'tatkal' && (
                    <div className="col-span-2">
                        <InfoField label="Tatkal Reason" value={application.tatkalReason} />
                    </div>
                )}
                {application.travelPlans === 'yes' && (
                    <>
                        <div className="col-span-2">
                            <InfoField label="Travel Details" value={application.travelDetails} />
                        </div>
                        <InfoField label="From Date" value={application.fromDate} />
                        <InfoField label="To Date" value={application.toDate} />
                    </>
                )}
            </div>
        </div>
    );

    const renderBonafideApplication = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <InfoField label="Application Type" value="Bonafide" />
                <InfoField label="Purpose" value={application.certificateFor} />
                <InfoField label="Current Semester" value={application.semester} />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-base-100 border-b border-base-200 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">View Application</h2>
                        <p className="text-sm text-gray-500">Submitted on {application.submittedDate}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onManage}
                            className="btn btn-primary btn-sm"
                        >
                            <FaEdit /> Manage
                        </button>
                        <button 
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            <FaTimesCircle />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Student Information */}
                    <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                        <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <InfoField label="Name" value={application.studentName} />
                            <InfoField label="Roll No" value={application.rollNo} />
                            <InfoField label="Department" value={application.department} />
                            <InfoField label="Program" value={application.program} />
                            <InfoField label="Semester" value={application.semester} />
                            <InfoField label="Email" value={application.email} />
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                        <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                        {application.type === 'passport' 
                            ? renderPassportApplication() 
                            : renderBonafideApplication()
                        }
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                        <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
                        <div className="space-y-4">
                            {application.comments.map((comment, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                                    <div>
                                        <p className="text-sm text-gray-600">{comment.text}</p>
                                        <p className="text-xs text-gray-400">
                                            {comment.date} by {comment.by}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

export default ViewApplication;
