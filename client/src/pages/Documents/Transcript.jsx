import React, { useState } from "react";
import DocumentLayout from "../../components/documentSection/DocumentLayout";
import PDFPreview from "../../components/documentSection/PDFPreview";
import TranscriptPDF from "../../components/documentSection/TranscriptPDF";
import { pdf } from "@react-pdf/renderer";
import { FaUser, FaIdBadge, FaGraduationCap, FaBook, FaCalendarAlt, FaChartLine, FaTint, FaPhone } from "react-icons/fa";

const TranscriptPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  const studentData = {
    name: "JOHN SMITH DOE",
    rollNo: "220103045",
    programme: "BTech",
    department: "Computer Science and Engineering",
    dateOfAdmission: "2022-07-28",
    currentSemester: "4th",
    cgpa: "8.75",
    contact: "+91 9876543210",
    photo: "https://example.com/student-photo.jpg", // Replace with actual URL
    courses: [
      { code: "CS101", name: "Data Structures", credit: "4", year: "2022", session: "Spring", grade: "A" },
      { code: "CS102", name: "Algorithms", credit: "4", year: "2022", session: "Fall", grade: "A-" },
      { code: "CS103", name: "Operating Systems", credit: "4", year: "2023", session: "Spring", grade: "B+" },
      { code: "CS104", name: "Computer Networks", credit: "3", year: "2023", session: "Fall", grade: "B" },
      { code: "CS105", name: "Database Systems", credit: "3", year: "2023", session: "Fall", grade: "A" },
    ],
    spiCpi: [
      { semester: "1", spi: "8.5", cpi: "8.5" },
      { semester: "2", spi: "8.7", cpi: "8.6" },
      { semester: "3", spi: "8.9", cpi: "8.7" },
      { semester: "4", spi: "9.1", cpi: "8.8" },
    ],
  };

  const studentInfo = [
    { label: "Name", value: studentData.name, icon: <FaUser /> },
    { label: "Roll No", value: studentData.rollNo, icon: <FaIdBadge /> },
    { label: "Programme", value: studentData.programme, icon: <FaGraduationCap /> },
    { label: "Department", value: studentData.department, icon: <FaBook /> },
    { label: "Current Semester", value: studentData.currentSemester, icon: <FaChartLine /> },
    { label: "CGPA", value: studentData.cgpa, icon: <FaChartLine /> },
  ];

  const handleGenerate = async () => {
    if (!studentData) {
      console.error("Error: Missing student data");
      return;
    }
    setIsLoading(true);
    try {
      const blob = await pdf(<TranscriptPDF student={studentData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
    } finally {
      setIsLoading(false);
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
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">Student Information</h1>

        <div className="bg-white shadow-md rounded-lg border border-gray-300 p-6">
          <div className="divide-y divide-gray-300">
            {studentInfo.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 px-4 py-3 ${index % 2 === 0 ? "bg-blue-100" : "bg-white"} rounded-md transition-transform transform hover:scale-[1.02] duration-300`}
              >
                <span className="text-indigo-700 text-lg">{item.icon}</span>
                <p className="text-gray-800 font-medium">{item.label}:</p>
                <p className="text-gray-900 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <PDFPreview pdfUrl={pdfUrl} isLoading={isLoading} />

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-600"
            }`}
          >
            {isLoading ? "Generating..." : "Generate Transcript"}
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="relative flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-green-600 to-teal-700 hover:from-teal-500 hover:to-green-600 shadow-lg transform hover:scale-105"
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
