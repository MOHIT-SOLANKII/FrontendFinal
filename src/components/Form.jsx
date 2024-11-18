import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import BGPic from "../assets/BGPic.png";
import LogoPic from "../assets/logo.jpeg";
import mujlogo from "../assets/mujlogo.png";
import sdclogo from "../assets/sdclogo.png";

const Form = () => {
  const [file, setFile] = useState(null);
  const [outlookMail, setOutlookMail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpires, setOtpExpires] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [nptelRollNo, setNptelRollNo] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [passedNptel, setPassedNptel] = useState("");
  const [otherExam, setOtherExam] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Add these new state variables right after your existing useState declarations
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCertificateVerified, setIsCertificateVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const resetForm = () => {
    setFile(null);
    setOtp("");
    setGeneratedOtp("");
    setOtpExpires("");
    setOtpSent(false);
    setOtpVerified(false);
    setRegistrationNumber("");
    setNptelRollNo("");
    setName("");
    setBranch("");
    setSection("");
    setSemester("");
    setSubject("");
    setPassedNptel("");
    setOtherExam("");
    setIsCertificateVerified(false);
    setVerificationStatus(null);
    // Don't reset outlookMail to preserve it for the next submission
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
  
      if (passedNptel === "Yes") {
        setIsVerifying(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
  
        try {
          const response = await axios.post(
            "https://nptel-backend.onrender.com/verify-certificate",  // Update URL to match your backend
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
  
          if (response.data.success && response.data.verified) {
            setIsCertificateVerified(true);
            setVerificationStatus("success");
            toast.success("Certificate verified successfully!");
          } else {
            setIsCertificateVerified(false);
            setVerificationStatus("error");
            toast.error(response.data.message || "Certificate verification failed");
          }
        } catch (error) {
          setIsCertificateVerified(false);
          setVerificationStatus("error");
          toast.error("Error verifying certificate");
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsCertificateVerified(true);
      }
    } else {
      toast.error("Please select a valid PDF file");
      setFile(null);
      setIsCertificateVerified(false);
    }
  };

  const sendOTP = async () => {
    if (!outlookMail) {
      toast.error("Please enter your Outlook email");
      return;
    }
  
    setOtpLoading(true);
    try {
      const response = await axios.post('https://nptel-backend.onrender.com/api/email/send-otp', {
        email: outlookMail
      });
  
      if (response.data.status === 'success') {
        toast.success("OTP sent successfully!");
        setGeneratedOtp(response.data.otp);
        setOtpExpires(response.data.otpExpires);
        setOtpSent(true);
      } else {
        toast.error("Error sending OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setVerifyLoading(true);
    try {
      if (new Date() > new Date(otpExpires)) {
        toast.error("OTP has expired");
        setVerifyLoading(false);
        return;
      }
      if (otp === generatedOtp) {
        toast.success("OTP verified successfully!");
        setOtpVerified(true);
        setOtpSent(false); // Hide OTP input field after verification
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("An error occurred while verifying the OTP.");
    }
    setVerifyLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !file ||
      !registrationNumber ||
      !name ||
      !section ||
      !semester ||
      !subject ||
      !nptelRollNo ||
      !branch ||
      !outlookMail
    ) {
      toast.error("Please fill in all fields and upload a PDF file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("registrationNumber", registrationNumber);
    formData.append("nptelRollNo", nptelRollNo);
    formData.append("name", name);
    formData.append("branch", branch);
    formData.append("section", section);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("outlookMail", `${outlookMail}@muj.manipal.edu`);
    formData.append("passedNptel", passedNptel);
    formData.append("otherExam", otherExam);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Certificate uploaded successfully.");
      resetForm(); // Reset the form after successful submission
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Error uploading file: Network Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getUploadLabel = () => {
    if (passedNptel === "Yes") {
      return "Upload NPTEL Certificate";
    } else if (passedNptel === "No" && otherExam === "Yes") {
      return "Upload Certificate or Email Screenshot (PDF)";
    } else if (passedNptel === "No" && otherExam === "No") {
      return "Upload NPTEL Grade Sheet and Goldman Proof of Work (Combined PDF)";
    }
    return "Upload Document";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        backgroundImage: `url(${BGPic})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full bg-white bg-opacity-90 rounded-2xl shadow-xl overflow-hidden"
        >
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <img
                src={mujlogo}
                alt="Left Logo"
                className="w-[150px] h-24 object-contain hidden sm:block"
              />
              <div className="flex-1 w-full sm:w-auto">
                <h2 className="text-[12px] sm:text-sm font-bold text-white text-center">
                  Department of Computer Science and Engineering
                </h2>
                <h2 className="text-[12px] sm:text-sm text-white text-center">
                  School of Computer Science and Engineering
                </h2>
                <h2 className="text-[12px] sm:text-sm font-bold text-white text-center">
                  Software Development Centre
                </h2>
              </div>
              <img
                src={sdclogo}
                alt="Right Logo"
                className="w-24 h-10 object-contain hidden sm:block"
              />
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-lg sm:text-2xl font-bold bg-gray-500 px-2 py-2 text-white text-center">
              NPTEL CERTIFICATE SUBMISSION 2024
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {/* Only show email field if OTP is not verified */}
            {!otpVerified && (
              <div className="space-y-4">
                <div className="space-y-2">
                <motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="relative w-full"
>
  <input
    type="text"
    placeholder="Enter MUJ outlook mail"
    value={outlookMail}
    onChange={(e) => setOutlookMail(e.target.value)}
    className="w-full px-3 sm:px-4 py-2 pr-24 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
  />
  <span className="absolute inset-y-0 right-1 top-1 bottom-1 flex items-center text-gray-800 text-sm sm:text-base bg-gray-200 px-8 rounded-md">
    @muj.manipal.edu
  </span>
</motion.div>

                  <motion.button
                    type="button"
                    onClick={sendOTP}
                    disabled={otpLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-4 rounded-md hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out font-medium text-sm sm:text-base"
                  >
                    {otpLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mx-auto text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Send OTP"
                    )}
                  </motion.button>
                </div>

                {/* Only show OTP verification if OTP is sent but not verified */}
                {otpSent && (
                  <div className="space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                      />
                    </motion.div>
                    <motion.button
                      type="button"
                      onClick={verifyOTP}
                      disabled={verifyLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-4 rounded-md hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out font-medium text-sm sm:text-base"
                    >
                      {verifyLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 mx-auto text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Verify OTP"
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* Show form fields only after OTP verification */}
            {otpVerified && (
              <div className="space-y-4">
                {/* Rest of your form fields remain the same */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="registrationNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registration Number
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    placeholder="Enter Registration Number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="nptelRollNo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    NPTEL Roll No
                  </label>
                  <input
                    id="nptelRollNo"
                    type="text"
                    placeholder="Enter NPTEL Roll No"
                    value={nptelRollNo}
                    onChange={(e) => setNptelRollNo(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Branch
                  </label>
                  <input
                    id="branch"
                    type="text"
                    placeholder="Enter Branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Semester
                  </label>
                  <input
                    id="semester"
                    type="text"
                    placeholder="Enter Semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="section"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Section
                  </label>
                  <input
                    id="section"
                    type="text"
                    placeholder="Enter Section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                  >
                    <option value="">Select the subject</option>
                    <option value="Design and Analysis of Algorithms">
                      Design and Analysis of Algorithms
                    </option>
                    <option value="Data Structures and Algorithms with Java">
                      Data Structures and Algorithms with Java
                    </option>
                    <option value="Data Structures and Algorithms with Python">
                      Data Structures and Algorithms with Python
                    </option>
                  </select>
                </motion.div>

                {subject && (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label
                        htmlFor="passedNptel"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Did you pass the NPTEL exam?
                      </label>
                      <select
                        id="passedNptel"
                        value={passedNptel}
                        onChange={(e) => {
                          setPassedNptel(e.target.value);
                          if (e.target.value === "Yes") {
                            setOtherExam("");
                          }
                        }}
                        required
                        className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                      >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </motion.div>

                    {passedNptel === "No" && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label
                          htmlFor="otherExam"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Did you participate in any other examination (e.g.,
                          Goldman Sachs)?
                        </label>
                        <select
                          id="otherExam"
                          value={otherExam}
                          onChange={(e) => setOtherExam(e.target.value)}
                          required
                          className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80"
                        >
                          <option value="">Select an option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </motion.div>
                    )}

                    {(passedNptel === "Yes" || otherExam) && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label
                          htmlFor="file"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {getUploadLabel()}
                          {passedNptel === "Yes" && (
                            <>
                              {isVerifying && (
                                <span className="ml-2 text-amber-500 text-xs">
                                  Verifying...
                                </span>
                              )}
                              {verificationStatus === "success" && (
                                <span className="ml-2 text-green-500 text-xs">
                                  Verified
                                </span>
                              )}
                              {verificationStatus === "error" && (
                                <span className="ml-2 text-red-500 text-xs">
                                  Verification Failed
                                </span>
                              )}
                            </>
                          )}
                        </label>
                        <input
                          id="file"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                          disabled={isVerifying}
                          className="w-full px-3 sm:px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 ease-in-out text-sm sm:text-base bg-white bg-opacity-80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                      </motion.div>
                    )}
                  </>
                )}

{(passedNptel === "Yes" && file) && (
  <div className="mt-4">
    {isVerifying && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="shrink-0">
            <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Verification in Progress</h3>
            <div className="mt-1 text-sm text-yellow-700">Verifying your certificate...</div>
          </div>
        </div>
      </div>
    )}

    {verificationStatus === 'error' && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex flex-col">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
              <div className="mt-1 text-sm text-red-700">
                Certificate verification failed - contents do not match
              </div>
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="mt-2 text-sm text-red-700 hover:text-red-600 font-medium"
                >
                  ▶ View Details
                </button>
              )}
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 bg-red-100 p-3 rounded-md">
              <p className="text-sm text-red-700">
                The uploaded certificate could not be verified against our records. Please ensure you've uploaded the correct NPTEL certificate.
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setFile(null);
              setShowDetails(false);
              setVerificationStatus(null);
              document.getElementById('file').value = '';
            }}
            className="mt-4 self-end text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903.619a.75.75 0 11-.484 1.42l-1.903-.62a7.5 7.5 0 11-12.064 1.945zm5.245-3.59L8.418 7.988a.75.75 0 01-.293 1.024l-1.292.97a.75.75 0 11-.9-1.2l1.292-.97a.75.75 0 011.024.294l1.582 1.52a.75.75 0 01-.02 1.062l-2.5 2.5a.75.75 0 11-1.06-1.06l2.5-2.5a.75.75 0 01.02-1.062z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    )}

    {verificationStatus === 'success' && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Certificate Verified</h3>
            <div className="mt-1 text-sm text-green-700">Certificate successfully verified</div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

                <motion.button
                  type="submit"
                  disabled={
                    loading || (passedNptel === "Yes" && !isCertificateVerified)
                  }
                  whileHover={{
                    scale:
                      loading ||
                      (passedNptel === "Yes" && !isCertificateVerified)
                        ? 1
                        : 1.05,
                  }}
                  whileTap={{
                    scale:
                      loading ||
                      (passedNptel === "Yes" && !isCertificateVerified)
                        ? 1
                        : 0.95,
                  }}
                  className={`w-full py-3 px-4 rounded-md transition duration-150 ease-in-out font-medium text-sm sm:text-base ${
                    loading || (passedNptel === "Yes" && !isCertificateVerified)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                  }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mx-auto text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Submit"
                  )}
                </motion.button>
              </div>
            )}
          </form>

          <div className="flex flex-row sm:flex-row gap-4 items-center justify-center p-4 bg-gray-500">
            <img
              src={LogoPic}
              alt="Company Logo"
              className="w-10 h-10 object-contain rounded-full"
            />
            <p className="text-sm font-medium">
              <span className="text-gray-100 italic">Developed by </span>
              <span className="text-md text-white underline">
                MOHIT SOLANKI
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Form;
