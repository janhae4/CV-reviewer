"use client";
import { useEffect, useRef, useState } from "react";
import { CiCircleCheck, CiCircleInfo } from "react-icons/ci";
import { FaRegTimesCircle } from "react-icons/fa";
import { HiArrowNarrowUp } from "react-icons/hi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { SlEnergy } from "react-icons/sl";
import SkeletonResult from "./components/skeleton";
import { useSectionScroll } from "./lib/hook/useSectionScroll";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    strengths: [],
    weaknesses: [],
    improvements: [],
    keywords: [],
    cvKeywords: [],
    missingKeywords: [],
    general: "",
    rate: "0/10",
  });
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showStrengths, setShowStrengths] = useState<boolean>(true);
  const [showWeaknesses, setShowWeaknesses] = useState<boolean>(true);
  const [showImprovements, setShowImprovements] = useState<boolean>(true);
  const [showKeywords, setShowKeywords] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [jobDescription, setJobDescription] = useState<string>("");

  const section0Ref = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  const [showUpButton, setShowUpButton] = useState<boolean>(false);

  const [showFaq1, setShowFaq1] = useState<boolean>(false);
  const [showFaq2, setShowFaq2] = useState<boolean>(false);
  const [showFaq3, setShowFaq3] = useState<boolean>(false);
  const [showFaq4, setShowFaq4] = useState<boolean>(false);

  const { currentIndex } = useSectionScroll([
    section0Ref,
    section1Ref,
    section2Ref,
    section3Ref,
  ]);

  useEffect(() => {
    if (currentIndex === 0) {
      setShowUpButton(false);
    } else {
      setShowUpButton(true);
    }
  }, [currentIndex]);

  const handleScroll = (number: number) => {
    if (number === 0) {
      setShowUpButton(false);
      section0Ref.current?.scrollIntoView({ behavior: "smooth" });
    } else if (number === 1) {
      section1Ref.current?.scrollIntoView({ behavior: "smooth" });
    } else if (number === 2) {
      section2Ref.current?.scrollIntoView({ behavior: "smooth" });
    } else if (number === 3) {
      section3Ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setElapsedTime(0);
    setLoading(true);
    setError("");
    setProgress(0);
    setResult({
      ...result,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      let val = 0;
      let isPostComplete = false;

      const handleComplete = () => {
        clearInterval(progressInterval);
        clearInterval(timeInterval);
        setLoading(false);
      };

      const progressInterval = setInterval(() => {
        if (!isPostComplete) {
          val += Math.random() * 5;
          if (val >= 70) val = 70;
        } else {
          val += Math.random() * 15;
          if (val >= 100) {
            val = 100;
            setTimeout(() => {
              handleComplete();
            }, 2000);
          }
        }
        setProgress(val);
      }, 300);

      const timeInterval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      const res = await fetch("/api/review", {
        method: "POST",
        body: formData,
      });

      isPostComplete = true;
      const data = await res.json();

      setResult(data);

      if (val >= 100) {
        setProgress(100);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-4" ref={section0Ref}>
          <div className="animated-bg min-h-screen flex flex-col items-center justify-center p-8">
            <div className="glass-container rounded-3xl p-12 max-w-6xl mx-auto floating glow-effect">
              <div className="icon-container inline-block p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl mb-4 backdrop-blur-sm border border-white/10">
                <IoDocumentTextOutline className="w-12 h-12 gradient-icon" />
              </div>
              <h1 className="text-8xl font-black glass-text text-center leading-tight text-3d mb-8">
                AI Resume Reviewer
              </h1>

              <div className="text-center">
                <p className="text-white/70 text-xl font-medium mb-6">
                  Công nghệ AI hiện đại để phân tích CV của bạn
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer hover:scale-105 ease-in-out duration-300"
                onClick={() => handleScroll(1)}
              >
                Các tính năng
              </button>
              <button
                className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer hover:scale-105 ease-in-out duration-300"
                onClick={() => handleScroll(2)}
              >
                Phân tích CV
              </button>
              <button
                className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer hover:scale-105 ease-in-out duration-300"
                onClick={() => handleScroll(3)}
              >
                Các câu hỏi
              </button>
            </div>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-140 left-340 w-3.5 h-3.5 bg-blue-400/30 rounded-full animate-bounce"></div>
              <div className="absolute bottom-40 right-20 w-4 h-4 bg-purple-400/20 rounded-full animate-ping delay-1000"></div>
              <div className="absolute top-60 left-120 w-4 h-4 bg-purple-400/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-102 left-40 w-3.5 h-3.5 bg-blue-400/30 rounded-full animate-bounce"></div>
              <div className="absolute bottom-150 right-140 w-4 h-4 bg-purple-400/20 rounded-full animate-ping delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Section 1 - Additional Features */}
        <div
          className="max-h-screen max-w-screen flex flex-col items-center justify-center py-20 mt-20"
          ref={section1Ref}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">
                Tính năng nổi bật
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Khám phá các tính năng mạnh mẽ giúp bạn tối ưu hóa CV và tăng cơ
                hội được tuyển dụng
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-violet-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      ATS Scoring
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Đánh giá độ tương thích CV với hệ thống ATS của nhà tuyển
                    dụng, giúp bạn vượt qua vòng lọc tự động.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Phân tích nhanh
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Xử lý và phân tích CV trong vòng vài giây với công nghệ AI
                    tiên tiến, tiết kiệm thời gian quý báu.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Gợi ý cải thiện
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Nhận được những gợi ý cụ thể và thực tiễn để cải thiện CV,
                    tăng cơ hội được mời phỏng vấn.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Hỗ trợ đa định dạng
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Hỗ trợ đọc và phân tích các file CV định dạng PDF, Word một
                    cách chính xác và nhanh chóng.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-pink-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Giao diện thân thiện
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Thiết kế giao diện hiện đại, dễ sử dụng với trải nghiệm
                    người dùng tối ưu trên mọi thiết bị.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl mr-4">
                      <svg
                        className="w-8 h-8 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Bảo mật tuyệt đối
                    </h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Đảm bảo an toàn thông tin cá nhân với công nghệ mã hóa tiên
                    tiến, dữ liệu không được lưu trữ.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <button
                onClick={() =>
                  section2Ref.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative z-10 flex items-center">
                  <SlEnergy className="w-6 h-6 mr-3" />
                  <span>Bắt đầu ngay</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div
          className="min-h-screen max-w-screen flex flex-col items-center justify-center py-20 px-10"
          ref={section2Ref}
        >
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Grid - Upload Section */}
            <div className="flex flex-col justify-between space-y-6">
              {/* File Upload */}
              <div
                className={`group relative transition-all duration-500 flex-1 ${
                  dragActive
                    ? "transform scale-105"
                    : "transform hover:scale-102 transition duration-300"
                }`}
              >
                <div
                  className={`relative p-8 rounded-3xl border-2 border-dashed transition-all duration-500 backdrop-blur-sm h-full flex items-center justify-center ${
                    dragActive
                      ? "border-violet-400 bg-violet-500/20 shadow-2xl shadow-violet-500/25"
                      : "border-gray-600 bg-white/5 hover:bg-white/10 hover:border-gray-500 hover:shadow-xl"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Upload Icon */}
                  <div className="text-center flex justify-center items-center gap-10 w-full">
                    <div>
                      <div className="inline-block p-6 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-16 h-16 text-gray-300 group-hover:text-white transition-colors duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">
                        {file ? `📄 ${file.name}` : "Upload CV"}
                      </h3>
                      <p className="text-gray-400 mb-2 text-lg">
                        Kéo thả file hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Hỗ trợ PDF và Word documents (Tối đa 10MB)
                      </p>

                      <input
                        type="file"
                        accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {file && (
                        <div className="mt-6 inline-flex items-center px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-sm font-medium shadow-lg">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          File đã được chọn
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Input */}
              <div className="group relative transition-all duration-500 hover:transform hover:scale-102 flex-1">
                <div className="relative p-8 rounded-3xl border-2 border-dashed border-gray-600 bg-white/5 hover:bg-white/10 hover:border-gray-500 transition-all duration-500 backdrop-blur-sm hover:shadow-xl h-full">
                  {/* Header */}
                  <div className="text-center mb-6 flex justify-center items-center gap-10">
                    <div className="inline-block p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg
                        className="w-16 h-16 text-gray-300 group-hover:text-white transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">
                        Job Description
                      </h3>
                      <p className="text-gray-400 mb-4 text-lg">
                        Paste JD vào đây để so sánh với CV
                      </p>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="relative flex-1">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full h-48 p-6 bg-gray-800/50 border-2 border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base leading-relaxed overflow-y-scroll"
                      placeholder="Paste Job Description tại đây..."
                      style={{ fontFamily: "inherit" }}
                    />

                    {/* Character count */}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                      {jobDescription.length} ký tự
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="group relative inline-flex items-center justify-center px-16 py-6 text-xl font-bold bg-white/5 border-white text-white transition-all duration-300 glow rounded-3xl hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 hover: disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-violet-500/30 transform hover:scale-102 active:scale-95 min-w-full cursor-pointer"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"></div>

                  <div className="relative z-10 flex flex-col items-center w-full">
                    {loading ? (
                      <div className="w-full space-y-4">
                        {/* Progress info */}
                        <div className="flex justify-between items-center w-full px-4">
                          <span className="text-lg font-bold text-white">
                            Đang phân tích...
                          </span>
                          <span className="text-lg font-bold text-white">
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-4 w-full bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-300 ease-out"
                            style={{
                              width: `${progress}%`,
                              boxShadow: "0 0 12px rgba(129, 140, 248, 0.8)",
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>

                        {/* Time indicator */}
                        <div className="flex items-center justify-center space-x-2 text-base text-white/90">
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Thời gian: {elapsedTime}s</span>
                        </div>
                      </div>
                    ) : progress === 100 ? (
                      <div className="flex items-center">
                        <CiCircleCheck className="w-8 h-8 mr-3 text-white" />
                        <span>Hoàn thành phân tích</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <SlEnergy className="w-8 h-8 mr-3 text-white" />
                        <span>Phân tích CV ngay</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Right Grid - Results Section */}
            <div className="col-span-2 max-h-screen">
              {/* Error Message */}
              {error && (
                <div className="mb-6">
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-7 h-7 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-red-200 font-medium text-lg">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Section or Skeleton */}
              {result.general ||
              result.strengths.length > 0 ||
              result.weaknesses.length > 0 ||
              result.improvements.length > 0 ? (
                <div className="max-h-screen">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-8 py-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl mr-6 shadow-lg">
                            <CiCircleInfo className="w-10 h-10 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-2">
                              Kết quả phân tích
                            </h3>
                            <p className="text-gray-300 text-md">
                              Phân tích hoàn thành bởi AI
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="px-6 py-3 bg-violet-500/20 rounded-full border border-violet-500/30">
                            <span className="text-violet-300 text-lg font-bold">
                              ATS Score: {result.rate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 h-[calc(100vh-350px)] overflow-y-scroll scrollable">
                      {/* Overview */}
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-6">
                          Tổng quan
                        </h2>
                        <div className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
                          <p className="text-gray-300 text-md leading-relaxed">
                            {result.general}
                          </p>
                        </div>
                      </div>

                      {/* Analysis Sections */}
                      <div className="space-y-6">
                        {/* Strengths */}
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 rounded-2xl overflow-hidden border border-green-800/50 shadow-lg">
                          <button
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-green-800/10 transition-colors duration-200"
                            onClick={() => setShowStrengths(!showStrengths)}
                          >
                            <div className="flex items-center">
                              <div className="p-3 bg-green-500/20 rounded-xl mr-5 shadow-md">
                                <CiCircleCheck className="w-8 h-8 text-green-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Điểm mạnh
                                </h3>
                                <p className="text-green-300 text-sm mt-1">
                                  {result.strengths.length} điểm mạnh được phát
                                  hiện
                                </p>
                              </div>
                            </div>
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                showStrengths ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {showStrengths && (
                            <div className="px-6 pb-6 border-t border-green-800/50">
                              <ul className="space-y-4 text-gray-300 mt-4">
                                {result.strengths.map((strength, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-400 mr-3 mt-1 text-xl">
                                      ✓
                                    </span>
                                    <span className="text-base leading-relaxed">
                                      {strength}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-gradient-to-r from-red-900/30 to-rose-900/20 rounded-2xl overflow-hidden border border-red-800/50 shadow-lg">
                          <button
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-red-800/10 transition-colors duration-200"
                            onClick={() => setShowWeaknesses(!showWeaknesses)}
                          >
                            <div className="flex items-center">
                              <div className="p-3 bg-red-500/20 rounded-xl mr-5 shadow-md">
                                <FaRegTimesCircle className="w-7 h-7 text-red-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Điểm yếu
                                </h3>
                                <p className="text-red-300 text-sm mt-1">
                                  {result.weaknesses.length} điểm cần cải thiện
                                </p>
                              </div>
                            </div>
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                showWeaknesses ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {showWeaknesses && (
                            <div className="px-6 pb-6 border-t border-red-800/50">
                              <ul className="space-y-4 text-gray-300 mt-4">
                                {result.weaknesses.map((weakness, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-red-400 mr-3 mt-1 text-xl">
                                      ✗
                                    </span>
                                    <span className="text-base leading-relaxed">
                                      {weakness}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Improvements */}
                        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 rounded-2xl overflow-hidden border border-blue-800/50 shadow-lg">
                          <button
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-800/10 transition-colors duration-200"
                            onClick={() =>
                              setShowImprovements(!showImprovements)
                            }
                          >
                            <div className="flex items-center">
                              <div className="p-3 bg-blue-500/20 rounded-xl mr-5 shadow-md">
                                <SlEnergy className="w-7 h-7 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Đề xuất cải thiện
                                </h3>
                                <p className="text-blue-300 text-sm mt-1">
                                  {result.improvements.length} gợi ý cải thiện
                                </p>
                              </div>
                            </div>
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                showImprovements ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {showImprovements && (
                            <div className="px-6 pb-6 border-t border-blue-800/50">
                              <ul className="space-y-4 text-gray-300 mt-4">
                                {result.improvements.map(
                                  (improvement, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <span className="text-blue-400 mr-3 mt-1 text-xl">
                                        →
                                      </span>
                                      <span className="text-base leading-relaxed">
                                        {improvement}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Keywords */}
                        <div className="bg-gradient-to-r from-yellow-900/30 to-lime-900/20 rounded-2xl overflow-hidden border border-yellow-800/50 shadow-lg">
                          <button
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-yellow-800/10 transition-colors duration-200"
                            onClick={() => setShowKeywords(!showKeywords)}
                          >
                            <div className="flex items-center">
                              <div className="p-3 bg-yellow-500/20 rounded-xl mr-5 shadow-md">
                                <SlEnergy className="w-7 h-7 text-yellow-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Từ khóa
                                </h3>
                                <p className="text-yellow-300 text-sm mt-1">
                                  {result.cvKeywords.length} /{" "}
                                  {result.keywords.length}
                                </p>
                              </div>
                            </div>
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                showKeywords ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {showKeywords && (
                            <div className="px-6 pb-6 border-t border-yellow-800/50">
                              <ul className="space-y-4 text-gray-300 mt-4">
                                <li key="keywords">
                                  <h2 className="text-lg font-bold text-white">
                                    Keywords
                                  </h2>
                                  <span className="text-yellow-400 mr-3 mt-1 text-xl">
                                    →
                                  </span>
                                  <span className="text-base leading-relaxed">
                                    {result.keywords.join(", ")}
                                  </span>
                                </li>
                                <li key={"CVkeywords"}>
                                  <h2 className="text-lg font-bold text-white">
                                    CV Keywords
                                  </h2>
                                  <span className="text-yellow-400 mr-3 mt-1 text-xl">
                                    →
                                  </span>
                                  <span className="text-base leading-relaxed">
                                    {result.cvKeywords.join(", ")}
                                  </span>
                                </li>
                                <li key={"MissingKeywords"}>
                                  <h2 className="text-lg font-bold text-white">
                                    Missing Keywords
                                  </h2>
                                  <span className="text-yellow-400 mr-3 mt-1 text-xl">
                                    →
                                  </span>
                                  <span className="text-base leading-relaxed">
                                    {result.missingKeywords.join(", ")}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-8 py-6 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center px-6 py-3 bg-violet-500/20 hover:bg-violet-500/30 rounded-xl transition-colors duration-200 text-violet-300 font-medium">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Tải xuống PDF
                          </button>
                          <button className="flex items-center px-6 py-3 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 rounded-xl transition-colors duration-200 text-fuchsia-300 font-medium">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                              />
                            </svg>
                            Chia sẻ
                          </button>
                        </div>
                        <div className="text-base text-gray-400">
                          Phân tích hoàn thành trong {elapsedTime} giây
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <SkeletonResult />
              )}
            </div>
          </div>
        </div>

        {/* Section 3 - FAQ */}
        <div
          className="min-h-screen max-w-screen flex flex-col items-center justify-center"
          ref={section3Ref}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">
                Câu hỏi thường gặp
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Tìm hiểu thêm về cách sử dụng công cụ phân tích CV của chúng tôi
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6 w-[40rem] max-h-[calc(100vh-30rem)] overflow-y-auto pr-2">
              {/* FAQ 1 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setShowFaq1(!showFaq1)}
                >
                  <h3 className="text-xl font-bold text-white">
                    Công cụ này hoạt động như thế nào?
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                      showFaq1 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showFaq1 && (
                  <div className="px-6 pb-6 border-t border-white/10 transition-all duration-300 ease-in-out">
                    <p className="text-gray-300 text-base leading-relaxed mt-4">
                      Công cụ sử dụng AI để phân tích CV của bạn và so sánh với
                      job description. Nó đánh giá các yếu tố như từ khóa, kỹ
                      năng, kinh nghiệm và cấu trúc CV để đưa ra điểm ATS và gợi
                      ý cải thiện cụ thể.
                    </p>
                  </div>
                )}
              </div>
              {/* FAQ 2 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setShowFaq2(!showFaq2)}
                >
                  <h3 className="text-xl font-bold text-white">
                    Điểm ATS là gì và tại sao nó quan trọng?
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                      showFaq2 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showFaq2 && (
                  <div className="px-6 pb-6 border-t border-white/10 transition-all duration-300 ease-in-out">
                    <p className="text-gray-300 text-base leading-relaxed mt-4">
                      ATS (Applicant Tracking System) là hệ thống theo dõi ứng
                      viên mà hầu hết các công ty sử dụng để lọc CV. Điểm ATS
                      cao (70-90%) có nghĩa là CV của bạn có khả năng cao vượt
                      qua vòng lọc tự động và được HR xem xét.
                    </p>
                  </div>
                )}
              </div>
              {/* FAQ 3 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setShowFaq3(!showFaq3)}
                >
                  <h3 className="text-xl font-bold text-white">
                    Dữ liệu CV của tôi có được lưu trữ không?
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                      showFaq3 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showFaq3 && (
                  <div className="px-6 pb-6 border-t border-white/10 transition-all duration-300 ease-in-out">
                    <p className="text-gray-300 text-base leading-relaxed mt-4">
                      Không, chúng tôi cam kết bảo mật thông tin của bạn. CV và
                      dữ liệu cá nhân chỉ được xử lý trong quá trình phân tích
                      và không được lưu trữ trên hệ thống. Mọi thông tin sẽ được
                      xóa ngay sau khi hoàn thành phân tích.
                    </p>
                  </div>
                )}
              </div>
              {/* FAQ 4 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setShowFaq4(!showFaq4)}
                >
                  <h3 className="text-xl font-bold text-white">
                    Tôi có thể sử dụng công cụ này miễn phí không?
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                      showFaq4 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showFaq4 && (
                  <div className="px-6 pb-6 border-t border-white/10 transition-all duration-300 ease-in-out">
                    <p className="text-gray-300 text-base leading-relaxed mt-4">
                      Có, công cụ hoàn toàn miễn phí cho tất cả người dùng.
                      Chúng tôi cung cấp dịch vụ này để giúp các ứng viên tối ưu
                      hóa CV và tăng cơ hội việc làm. Không có phí ẩn hay giới
                      hạn số lần sử dụng.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showUpButton && (
          <div className="bottom-8 right-8 fixed">
            <button
              onClick={() => handleScroll(0)}
              className="group relative inline-flex items-center p-4 rounded-full text-xl font-bold text-white transition-all duration-300 bg-white/10 border-1 border-white/20 backdrop-blur-sm  hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-sm rounded-full"></div>
              <div className="relative z-10 flex items-center">
                <HiArrowNarrowUp />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
