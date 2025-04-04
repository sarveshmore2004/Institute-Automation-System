import React, { useState, useEffect } from "react";
import styles from "./FeePayment.module.css"; // Ensure this path is correct
import { pdf } from "@react-pdf/renderer"; // Import pdf function
import FeeReceiptPDF from "../components/documentSection/FeeReceiptPDF"; // Import your PDF component structure
import axios from 'axios'; // <--- Import Axios

// This component assumes FeeReceiptPDF exists at the specified path
// and accepts props: student, semester, feeData, isPaid, transactionDetails

// --- Helper function to load Razorpay script ---
const loadRazorpayScript = (src) => {
    // ... (paste the function from step 2 above) ...
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
// --- The Razorpay Checkout script URL ---
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

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
    const payableAmount = (calculatedTotal - adjustmentAmount)*0 + 2;

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

    // --- UPDATED handlePayFee Function ---
    const handlePayFee = async () => {
        console.log("Attempting to pay fee...");
        setIsLoading(true); // Start loading indicator

        // 1. Load the Razorpay script
        const scriptLoaded = await loadRazorpayScript(RAZORPAY_SCRIPT_URL);
        if (!scriptLoaded) {
            alert('Failed to load payment gateway. Please check your connection and try again.');
            setIsLoading(false);
            return;
        }

        // 2. Call backend to create an order
        try {
            const backendUrl = 'http://localhost:8000/api/payment/create-order'; // Your backend endpoint
            const orderPayload = {
                amount: payableAmount, // Send amount in base currency unit (e.g., INR)
                currency: 'INR',
            };

            console.log("Sending to backend:", orderPayload);
            const { data } = await axios.post(backendUrl, orderPayload);
            console.log("Received order data from backend:", data);

            const { orderId, currency, amount: amountInPaise } = data; // Destructure response

            console.log("Using Razorpay Key ID for Frontend:", process.env.REACT_APP_RAZORPAY_KEY_ID); // <-- ADD THIS

            // 3. Configure Razorpay Checkout Options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID", // Use environment variable for Key ID (IMPORTANT!)
                amount: amountInPaise, // Amount from backend (in paise)
                currency: currency,
                name: "IIT Guwahati", // Display name
                description: `Fee Payment - Sem ${student.currentSemester}`,
                image: "/logo-url.png", // Optional: Your logo URL
                order_id: orderId, // Crucial: Order ID from backend
                handler: function (response) {
                    // --- This function executes on successful payment ---
                    console.log("Razorpay Success Response:", response);
                    alert("Payment Successful!");

                    // Update frontend state to reflect payment
                    setIsPaid(true);
                    setPaymentDetails({
                        slNo: paymentDetails?.slNo ? paymentDetails.slNo + 1 : 1, // Increment Sl No. or start at 1
                        feeType: feeSummary.feeType,
                        feeAmount: payableAmount, // Amount paid
                        transactionId: response.razorpay_payment_id, // Payment ID from Razorpay
                        razorpayOrderId: response.razorpay_order_id, // Order ID from Razorpay
                        razorpaySignature: response.razorpay_signature, // Signature
                        dateTime: new Date().toLocaleString("sv-SE"), // Timestamp
                        status: "Success",
                    });

                    // IMPORTANT FOR PRODUCTION:
                    // You should now ideally call your backend's '/api/payment/verify' endpoint
                    // with the response data (razorpay_payment_id, razorpay_order_id, razorpay_signature)
                    // to securely verify the payment signature on the server before fully trusting the transaction.
                    // For this test setup, we are directly updating the UI based on this handler.

                    setIsLoading(false); // Stop loading indicator AFTER processing response
                },
                prefill: {
                    name: student.name,
                    email: student.email || "", // Optional prefill
                    contact: student.contact || "" // Optional prefill
                },
                notes: {
                    address: "Your Institution Address", // Optional notes
                    roll_number: student.rollNumber,
                    semester: student.currentSemester,
                },
                theme: {
                    color: "#3399cc" // Optional theme color
                },
                modal: {
                    ondismiss: function () {
                        console.log('Razorpay checkout modal dismissed.');
                        // Only stop loading if the payment wasn't successful yet
                        if (!isPaid) {
                            setIsLoading(false);
                        }
                    }
                }
            };

            // 4. Create Razorpay instance and open Checkout
            // Ensure window.Razorpay is available
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                // Add error handling for the checkout instance itself
                rzp.on('payment.failed', function (response) {
                    console.error("Razorpay Payment Failed Event:", response.error);
                    alert(`Payment Failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
                    // Make sure loading stops on explicit failure event
                    setIsLoading(false);
                });
                rzp.open();
            } else {
                alert('Payment gateway failed to initialize.');
                setIsLoading(false);
            }


        } catch (error) {
            console.error("Payment failed:", error);
            let errorMessage = "Payment failed. Please try again.";
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = `Payment failed: ${error.response.data.error}`;
            } else if (error.message) {
                errorMessage = `Payment failed: ${error.message}`;
            }
            alert(errorMessage);
            setIsLoading(false); // Stop loading indicator on error
        }
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
                    onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
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