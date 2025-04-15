import React, { useState } from "react";
import DocumentLayout from "../../components/documentSection/DocumentLayout";
import PDFPreview from "../../components/documentSection/PDFPreview";
import TranscriptPDF from "../../components/documentSection/TranscriptPDF";
import { pdf } from "@react-pdf/renderer";
import { FaUser, FaIdBadge, FaGraduationCap, FaBook, FaExclamationCircle } from "react-icons/fa";
import { useQuery } from 'react-query';
import newRequest from '../../utils/newRequest'; // Assuming you're using this to make API calls

const TranscriptPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Get user data from localStorage
  const { data: userData } = JSON.parse(localStorage.getItem("currentUser"));
  const { userId } = userData.user;

  // Fetch student data
  const { isLoading, error, data: studentData } = useQuery({
    queryKey: [`student-${userId}`],
    queryFn: () =>
      newRequest.get(`/student/${userId}`).then((res) => res.data),
  });

  // Fetch student grades and courses data using the correct route
  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useQuery({
    queryKey: [`grades-${userId}`],
    queryFn: () =>
      newRequest.get(`/student/${userId}/grades`).then((res) => res.data), // Correct API call
  });

  // Show loading or error states
  if (isLoading || gradesLoading) {
    return (
      <DocumentLayout title="Transcript">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student information...</p>
          </div>
        </div>
      </DocumentLayout>
    );
  }

  if (error || gradesError) {
    return (
      <DocumentLayout title="Transcript">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading student information. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </DocumentLayout>
    );
  }

  const fullStudent = {
    name: studentData?.name || "N/A",
    rollNo: studentData?.rollNo || "N/A",
    programme: studentData?.program || "N/A",
    branch: studentData?.department || "N/A",
    semester: studentData?.semester || "N/A",
    photo: studentData?.photo || "https://example.com/student-photo.jpg", // Assuming photo exists in studentData
  };

  const studentInfo = [
    { label: "Name", value: fullStudent.name, icon: <FaUser /> },
    { label: "Roll No", value: fullStudent.rollNo, icon: <FaIdBadge /> },
    { label: "Programme", value: fullStudent.programme, icon: <FaGraduationCap /> },
    { label: "Department", value: fullStudent.branch, icon: <FaBook /> },
    { label: "Current Semester", value: fullStudent.semester, icon: <FaGraduationCap /> }
  ];

  const handleGenerate = async () => {
    if (!studentData || !gradesData) {
      console.error("Error: Missing student data or grades data");
      return;
    }

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <TranscriptPDF
          student={fullStudent} // Passing full student data
          courses={gradesData.courses} // Pass courses data from gradesData
          spiCpi={gradesData.spiCpi} // Pass SPI and CPI data
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = "Student_Transcript.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DocumentLayout title="Transcript">
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Student Information</h1>

        {/* Student Information Section */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {studentInfo.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 border-b border-gray-200 md:border-none md:p-0 transition-colors duration-200 hover:bg-gray-50 rounded-md md:hover:bg-transparent"
              >
                <span className="text-blue-700 text-xl bg-blue-100 p-2 rounded-full">
                  {item.icon}
                </span>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                  <p className="text-gray-900 font-semibold text-base">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PDFPreview pdfUrl={pdfUrl} isLoading={isGenerating} />

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-md transform hover:scale-105 ${
              isGenerating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-600"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate Transcript"}
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 bg-blue-700 hover:bg-blue-600 shadow-md transform hover:scale-105"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>
    </DocumentLayout>
  );
};

export default TranscriptPage;
