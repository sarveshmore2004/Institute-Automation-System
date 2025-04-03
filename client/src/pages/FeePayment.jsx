import React, { useState, useEffect } from "react";
import styles from "./FeePayment.module.css"; // Ensure this path is correct
import { pdf } from "@react-pdf/renderer"; // Import pdf function
import FeeReceiptPDF from "../components/documentSection/FeeReceiptPDF"; // Import your PDF component structure

// This component assumes FeeReceiptPDF exists at the specified path
// and accepts props: student, semester, feeData, isPaid, transactionDetails

const FeePayment = () => {
  // --- State ---
  const [isPaid, setIsPaid] = useState(false); // Tracks if the current fee is paid
  const [paymentDetails, setPaymentDetails] = useState(null); // Holds details of the successful transaction
  const [isLoading, setIsLoading] = useState(true); // For initial page load and payment processing
  const [isDownloading, setIsDownloading] = useState(false); // For PDF download button loading state

  // --- Static Data (Replace with API fetched data where applicable) ---
  const student = {
    rollNumber: "220101125",
    name: "Priyanshu Pratyay", // Use the correct name from original component
    photo: "/tnmy.png", // Ensure this path relative to public folder is correct
    branch: "Computer Science & Engineering",
    programme: "B.Tech",
    currentSemester: "July-Nov 2024", // Example semester
    // Add other fields if FeeReceiptPDF expects them, e.g., department
    department: "Computer Science & Engineering",
  };

  // Fee breakdown structure
  const feeParticularsData = [
    { particular: "Tuition Fees", amount: "100000.00" },
    { particular: "Examination Fee", amount: "500.00" },
    { particular: "Registration/Enrollment Fee", amount: "1000.00" },
    { particular: "Gymkhana Fee", amount: "1000.00" },
    { particular: "Medical Fee", amount: "1900.00" },
    { particular: "Hostel Fund", amount: "600.00" },
    { particular: "Hostel Rent", amount: "1000.00" },
    { particular: "Electricity and Water Charges", amount: "2500.00" },
    { particular: "Adjustable Mess Advance", amount: "20000.00" }, // Renamed slightly for clarity
    { particular: "Students Brotherhood Fund", amount: "50.00" },
    { particular: "Academic Facilities Fee", amount: "2500.00" },
    { particular: "Hostel Maintenance Charge", amount: "3000.00" },
    { particular: "Students Travel Assistance Fund", amount: "50.00" },
  ];

  // Calculate summary values
  const calculatedTotal = feeParticularsData.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0), // Handle potential missing amount
    0
  );
  const adjustmentAmount = 0.00; // Example adjustment
  const payableAmount = calculatedTotal - adjustmentAmount;

  // Prepare data structure needed for the FeeReceiptPDF component
  // Includes particulars and summary rows
  const feeDataForPDF = [
      ...feeParticularsData,
      { particular: "Total Amount", amount: calculatedTotal.toFixed(2) },
      { particular: "Adjustment Amount", amount: adjustmentAmount.toFixed(2) },
      { particular: "Payable Amount", amount: payableAmount.toFixed(2) },
      // Add Remarks if FeeReceiptPDF expects it, otherwise it can be omitted
      // { particular: "Remarks", amount: isPaid ? "Payment Received" : "Due" }
  ];

  // Data for the UI summary table
  const feeSummary = {
    semester: student.currentSemester,
    feeType: "Registration/Enrollment Fee", // Example fee type for overview
    totalFee: calculatedTotal,
    feePaid: isPaid ? payableAmount : 0.00,
    feeToBePaid: isPaid ? 0.00 : payableAmount,
    remarks: isPaid ? "Paid" : "Due", // UI remark
    payableAmount: payableAmount,
    detailedRemarks: isPaid ? "Payment Received" : null, // Detailed remark for breakdown table
  };

  // --- Simulate fetching initial fee status ---
  useEffect(() => {
    const fetchFeeStatus = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // --- SIMULATION ---
      // Change this value to test the two states (paid/unpaid) on initial load
      const alreadyPaid = false;
      // --- END SIMULATION ---

      setIsPaid(alreadyPaid);
      if (alreadyPaid) {
        // If already paid, set mock payment details required for the receipt
        setPaymentDetails({
          slNo: 1, // Example serial number
          feeType: feeSummary.feeType,
          feeAmount: feeSummary.payableAmount, // Crucial: Amount actually paid
          transactionId: "PAID_PREVIOUSLY_123", // Example ID
          dateTime: "2024-07-15 11:30:00", // Example timestamp
          status: "Success",
        });
      } else {
        setPaymentDetails(null); // Ensure no details if not paid
      }
      setIsLoading(false); // Done loading initial status
    };

    fetchFeeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs only once on mount

  // --- Handlers ---

  // Simulate clicking "Pay Fee" button
  const handlePayFee = () => {
    console.log("Initiating payment process...");
    // In a real app: Redirect to payment gateway or open modal
    alert(`Simulating redirection to payment gateway to pay ${formatCurrency(feeSummary.payableAmount)}...`);

    setIsLoading(true); // Show processing state

    // Simulate payment success after a delay
    setTimeout(() => {
      setIsPaid(true);
      // Set the actual payment details after successful simulation
      setPaymentDetails({
        slNo: 1, // Or fetch the next sequence number
        feeType: feeSummary.feeType,
        feeAmount: feeSummary.payableAmount, // Amount paid in this transaction
        transactionId: `TXN${Date.now()}`, // Generate a unique dummy ID
        dateTime: new Date().toLocaleString("sv-SE"), // Use 'sv-SE' for YYYY-MM-DD HH:MM:SS format
        status: "Success",
      });
      setIsLoading(false); // Payment processing finished
      console.log("Payment Successful (Simulated)");
      alert("Payment Successful! You can now download the receipt.");
    }, 2500); // Simulate network/processing time
  };

  // Handle downloading the receipt PDF
  // This replicates the core logic from FeeReceiptPage.jsx's handlers
  const handleDownloadReceipt = async () => {
    // Ensure payment was successful and we have details
    // Also prevent multiple clicks while processing
    if (!isPaid || !paymentDetails || isDownloading) {
        console.log("Download conditions not met or already downloading.");
        return;
    }

    setIsDownloading(true); // Show loading state on the download button
    console.log("Generating PDF receipt...");

    try {
      // 1. Generate PDF Blob using the imported FeeReceiptPDF component
      //    Pass data currently available in *this* component's state.
      const blob = await pdf(
        <FeeReceiptPDF
          student={student} // Pass the student data object
          semester={student.currentSemester} // Pass the relevant semester
          feeData={feeDataForPDF} // Pass the prepared fee data array (particulars + summaries)
          isPaid={isPaid} // Pass the payment status (should be true here)
          transactionDetails={paymentDetails} // Pass the actual transaction details
        />
      ).toBlob();

      // 2. Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // 3. Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Fee_Receipt_${student.rollNumber}_Sem${student.currentSemester}.pdf`; // Create a dynamic filename

      // 4. Append link, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 5. Revoke the Blob URL to free up memory
      URL.revokeObjectURL(url);

      console.log("Receipt download initiated.");

    } catch (error) {
      console.error("Error generating or downloading PDF receipt:", error);
      alert("Failed to generate PDF receipt. An error occurred.");
    } finally {
      setIsDownloading(false); // Reset the download button loading state
    }
  };

  // --- Helper Function ---
  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    // Handle cases where amount might be null, undefined, or non-numeric
    if (isNaN(numericAmount)) {
        return '₹ --.--'; // Or return 'N/A' or formatCurrency(0)
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  // --- Render Logic ---
  if (isLoading && !paymentDetails && !isPaid) { // Show full page loading only initially
    return (
      <div className={`${styles.feePaymentContainer} ${styles.loadingState}`}>
        <p>Loading Fee Details...</p> {/* Add a spinner component here if desired */}
      </div>
    );
  }

  return (
    <div className={styles.feePaymentContainer}>
      <h1 className={styles.pageTitle}>Academic Fee Payment</h1>

      {/* --- Student Identification --- */}
      <section className={styles.studentInfoSection}>
         <img
            src={student.photo}
            alt={`${student.name}'s profile`}
            className={styles.profilePhoto}
            // Add a fallback image source in case the primary one fails
            onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png"; }}
        />
        <div className={styles.studentDetails}>
          <h2>{student.name}</h2>
          <p><strong>Roll No:</strong> <span>{student.rollNumber}</span></p>
          <p><strong>Programme:</strong> <span>{student.programme} - {student.branch}</span></p>
          <p><strong>Semester:</strong> <span>{student.currentSemester}</span></p>
        </div>
      </section>

       {/* --- Fee Overview Section --- */}
       <section className={styles.feeSection}>
        <div className={styles.tableWrapper}>
          <table className={`${styles.dataTable} ${styles.overviewTable}`}>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Fee Type</th>
                <th className={styles.amountCell}>Total Fee</th>
                <th className={styles.amountCell}>Fee Paid</th>
                <th className={styles.amountCell}>Amount Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{feeSummary.semester}</td>
                <td>{feeSummary.feeType}</td>
                <td className={styles.amountCell}>{formatCurrency(feeSummary.totalFee)}</td>
                <td className={styles.amountCell}>{formatCurrency(feeSummary.feePaid)}</td>
                <td className={`${styles.amountCell} ${!isPaid ? styles.amountDue : ''}`}>
                  {formatCurrency(feeSummary.feeToBePaid)}
                </td>
                 <td>
                  {/* Status Badge */}
                  <span className={`${styles.statusBadge} ${isPaid ? styles.statusPaid : styles.statusDue}`}>
                    {feeSummary.remarks}
                  </span>
                </td>
                <td>
                  {/* Action Button: Pay or Confirmation Text */}
                  {!isPaid ? (
                    <button
                      onClick={handlePayFee}
                      className={`${styles.actionButton} ${styles.payButton}`}
                      disabled={isLoading} // Disable button during payment processing
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Pay'}
                    </button>
                  ) : (
                     <span className={styles.statusTextPaid}>✓ Payment Complete</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


      {/* --- Detailed Fee Breakdown Section --- */}
      <section className={styles.feeSection}>
         <h2 className={styles.sectionTitle}>Fee Breakdown</h2>
         <div className={styles.tableWrapper}>
            <table className={`${styles.dataTable} ${styles.breakdownTable}`}>
               <thead>
                    <tr>
                        <th>Particulars</th>
                        <th className={styles.textRight}>Amount (INR)</th>
                    </tr>
                </thead>
               <tbody>
                  {/* Map through particulars only */}
                  {feeParticularsData.map((item, index) => (
                     <tr key={`particular-${index}`}>
                        <td>{item.particular}</td>
                        <td className={styles.amountCell}>{formatCurrency(item.amount)}</td>
                     </tr>
                  ))}
                  {/* Manually add summary rows for specific styling */}
                  <tr className={styles.totalRow}>
                     <td><strong>Total Amount</strong></td>
                     <td className={styles.amountCell}><strong>{formatCurrency(feeSummary.totalFee)}</strong></td>
                  </tr>
                  <tr>
                     <td>Adjustment Amount</td>
                     <td className={styles.amountCell}>{formatCurrency(adjustmentAmount)}</td>
                  </tr>
                  <tr className={styles.payableRow}>
                     <td><strong>Net Payable Amount</strong></td>
                     <td className={styles.amountCell}><strong>{formatCurrency(feeSummary.payableAmount)}</strong></td>
                  </tr>
                  <tr className={styles.remarksRow}>
                     <td>Remarks</td>
                     {/* Display detailed remarks if available, otherwise '--' */}
                     <td className={styles.amountCell}>{feeSummary.detailedRemarks || '--'}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </section>

      {/* --- Payment History/Confirmation Section (Show only if paid) --- */}
      {isPaid && paymentDetails && (
        <section className={`${styles.feeSection} ${styles.paymentHistorySection}`}>
          <h2 className={styles.sectionTitle}>Payment Confirmation</h2>
          <div className={styles.tableWrapper}>
            <table className={`${styles.dataTable} ${styles.historyTable}`}>
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Fee Type</th>
                  <th className={styles.amountCell}>Amount Paid</th>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{paymentDetails.slNo}</td>
                  <td>{paymentDetails.feeType}</td>
                  <td className={styles.amountCell}>{formatCurrency(paymentDetails.feeAmount)}</td>
                  <td>{paymentDetails.transactionId}</td>
                  <td>{paymentDetails.dateTime}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusSuccess}`}>
                        {paymentDetails.status}
                    </span>
                  </td>
                  <td>
                    {/* Download Button with Loading State */}
                    <button
                      onClick={handleDownloadReceipt}
                      className={`${styles.actionButton} ${styles.receiptButton}`}
                      disabled={isDownloading} // Disable while generating/downloading
                    >
                      {isDownloading ? 'Generating...' : 'Download Receipt'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default FeePayment;