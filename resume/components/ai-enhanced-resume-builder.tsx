"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { PlusCircle, Trash2, Download } from 'lucide-react'
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = 'AIzaSyCkIbhNfuE6UtkY-aVAqoZZUZ5sQOY5znw';
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export function AiEnhancedResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  })
  const [experience, setExperience] = useState([
    { company: "", position: "", duration: "", description: "" }
  ])
  const [education, setEducation] = useState([
    { degree: "", school: "", year: "" }
  ])
  const [skills, setSkills] = useState([""])
  const [fontSize, setFontSize] = useState(16)
  const [generatedResponsibilities, setGeneratedResponsibilities] = useState<{ [key: number]: string[] }>({})
  const [selectedTemplate, setSelectedTemplate] = useState("standard")

  const updatePersonalInfo = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...experience]
    newExperience[index] = { ...newExperience[index], [field]: value }
    setExperience(newExperience)
  }

  const addExperience = () => {
    setExperience([...experience, { company: "", position: "", duration: "", description: "" }])
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
    setGeneratedResponsibilities(prev => {
      const newResponsibilities = { ...prev }
      delete newResponsibilities[index]
      return newResponsibilities
    })
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setEducation(newEducation)
  }

  const addEducation = () => {
    setEducation([...education, { degree: "", school: "", year: "" }])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = value
    setSkills(newSkills)
  }

  const addSkill = () => {
    setSkills([...skills, ""])
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const generateResponsibilities = async (description: string): Promise<string[]> => {
    if (!description) return ["No responsibilities provided."];

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Improve and format the following job description into clear, action-oriented bullet points. Keep the same content and meaning, but make it more impactful:

${description}

Format each point on a new line without bullet points or numbers. Focus on:
- Using strong action verbs
- Adding specific metrics where mentioned
- Making each point concise and impactful`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Split the text into lines and filter out empty lines
      const responsibilities = text.split('\n').filter(line => line.trim().length > 0);
      return responsibilities;
    } catch (error) {
      console.error('Error generating responsibilities:', error);
      return ["Error improving responsibilities."];
    }
  }

  const downloadResume = async () => {
    const resumeElement = document.getElementById('resume-preview')
    if (resumeElement) {
      const canvas = await html2canvas(resumeElement)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('resume.pdf')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      <div className="lg:w-1/2 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">AI-Enhanced Resume Builder</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Personal Information</h2>
            <Input
              placeholder="Full Name"
              value={personalInfo.name}
              onChange={(e) => updatePersonalInfo("name", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Professional Title"
              value={personalInfo.title}
              onChange={(e) => updatePersonalInfo("title", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Email"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Phone"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Location"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
              className="mb-2"
            />
            <Textarea
              placeholder="Professional Summary"
              value={personalInfo.summary}
              onChange={(e) => updatePersonalInfo("summary", e.target.value)}
              className="mb-2"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Select Template</h2>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="standard">Standard</option>
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Experience</h2>
            {experience.map((job, index) => (
              <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow">
                <Input
                  placeholder="Company"
                  value={job.company}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  className="mb-2"
                />
                <Input
                  placeholder="Position"
                  value={job.position}
                  onChange={(e) => updateExperience(index, "position", e.target.value)}
                  className="mb-2"
                />
                <Input
                  placeholder="Duration"
                  value={job.duration}
                  onChange={(e) => updateExperience(index, "duration", e.target.value)}
                  className="mb-2"
                />
                <Textarea
                  placeholder="Describe your role and responsibilities. For example: Managed a team of software developers working on a cloud-based CRM system, focusing on improving customer engagement and data analytics capabilities. Led agile development processes and implemented new features that increased user satisfaction by 40%."
                  value={job.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={async () => {
                    const responsibilities = await generateResponsibilities(job.description);
                    setGeneratedResponsibilities(prev => ({ ...prev, [index]: responsibilities }));
                  }}
                  className="mb-2"
                >
                  Generate Responsibilities with AI
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removeExperience(index)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Job
                </Button>
              </div>
            ))}
            <Button onClick={addExperience} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow">
                <Input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  className="mb-2"
                />
                <Input
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, "school", e.target.value)}
                  className="mb-2"
                />
                <Input
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => updateEducation(index, "year", e.target.value)}
                  className="mb-2"
                />
                <Button variant="destructive" size="sm" onClick={() => removeEducation(index)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Education
                </Button>
              </div>
            ))}
            <Button onClick={addEducation} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Skills</h2>
            {skills.map((skill, index) => (
              <div key={index} className="mb-2 flex items-center">
                <Input
                  placeholder="Skill"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="mr-2"
                />
                <Button variant="destructive" size="sm" onClick={() => removeSkill(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addSkill} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">Font Size</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Smaller</span>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                max={20}
                min={12}
                step={1}
                className="w-[60%]"
              />
              <span className="text-sm">Larger</span>
            </div>
            <p className="text-center mt-2">Current font size: {fontSize}px</p>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 p-8 bg-white overflow-y-auto">
        <div className="mb-4 flex justify-end">
          <Button onClick={downloadResume}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
        <div id="resume-preview" className={`max-w-[800px] mx-auto p-8 bg-white shadow-lg ${
          selectedTemplate === "modern" ? "font-sans" :
          selectedTemplate === "minimalist" ? "font-serif" :
          "font-sans"
        }`} style={{ fontSize: `${fontSize}px` }}>
          {selectedTemplate === "modern" && (
            <div className="bg-blue-600 text-white p-6 mb-6">
              <h1 className="text-4xl font-bold mb-1" style={{ fontSize: `${fontSize * 1.5}px` }}>{personalInfo.name || "Your Name"}</h1>
              <p className="text-xl mb-2" style={{ fontSize: `${fontSize * 1.25}px` }}>{personalInfo.title || "Professional Title"}</p>
              <div className="text-sm">
                <p>{personalInfo.email || "email@example.com"} | {personalInfo.phone || "Phone Number"}</p>
                <p>{personalInfo.location || "Location"}</p>
              </div>
            </div>
          )}
          {selectedTemplate === "minimalist" && (
            <div className="border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-4xl font-light mb-1" style={{ fontSize: `${fontSize * 1.5}px` }}>{personalInfo.name || "Your Name"}</h1>
              <p className="text-xl text-gray-600 mb-2" style={{ fontSize: `${fontSize * 1.25}px` }}>{personalInfo.title || "Professional Title"}</p>
              <div className="text-sm text-gray-600">
                <p>{personalInfo.email || "email@example.com"} | {personalInfo.phone || "Phone Number"} | {personalInfo.location || "Location"}</p>
              </div>
            </div>
          )}
          {selectedTemplate === "standard" && (
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-1" style={{ fontSize: `${fontSize * 1.5}px` }}>{personalInfo.name || "Your Name"}</h1>
              <p className="text-xl text-gray-600 mb-2" style={{ fontSize: `${fontSize * 1.25}px` }}>{personalInfo.title || "Professional Title"}</p>
              <div className="text-sm text-gray-600">
                <p>{personalInfo.email || "email@example.com"} | {personalInfo.phone || "Phone Number"}</p>
                <p>{personalInfo.location || "Location"}</p>
              </div>
            </div>
          )}
          <div className="mb-6">
            <h2 className={`text-2xl font-semibold mb-2 ${
              selectedTemplate === "modern" ? "text-blue-600 uppercase" :
              selectedTemplate === "minimalist" ? "font-light border-b border-gray-300 pb-1" :
              "text-gray-800 text-center"
            }`} style={{ fontSize: `${fontSize * 1.25}px` }}>Professional Summary</h2>
            <p className={`${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-800"}`}>{personalInfo.summary || "Your professional summary goes here."}</p>
          </div>
          <div className="mb-6">
            <h2 className={`text-2xl font-semibold mb-2 ${
              selectedTemplate === "modern" ? "text-blue-600 uppercase" :
              selectedTemplate === "minimalist" ? "font-light border-b border-gray-300 pb-1" :
              "text-gray-800 text-center"
            }`} style={{ fontSize: `${fontSize * 1.25}px` }}>Experience</h2>
            {experience.map((job, index) => (
              <div key={index} className="mb-4">
                <h3 className={`text-xl font-semibold ${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-800"}`} style={{ fontSize: `${fontSize * 1.1}px` }}>{job.position || "Job Position"}</h3>
                <p className={`${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-600"} italic`}>{job.company || "Company"} | {job.duration || "Duration"}</p>
                <ul className={`list-disc list-inside ${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-700"} mt-2`}>
                  {generatedResponsibilities[index]?.map((resp, respIndex) => (
                    <li key={respIndex}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <h2 className={`text-2xl font-semibold mb-2 ${
              selectedTemplate === "modern" ? "text-blue-600 uppercase" :
              selectedTemplate === "minimalist" ? "font-light border-b border-gray-300 pb-1" :
              "text-gray-800 text-center"
            }`} style={{ fontSize: `${fontSize * 1.25}px` }}>Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="mb-2">
                <h3 className={`text-xl font-semibold ${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-800"}`} style={{ fontSize: `${fontSize * 1.1}px` }}>{edu.degree || "Degree"}</h3>
                <p className={`${selectedTemplate === "minimalist" ? "text-gray-700" : "text-gray-600"}`}>{edu.school || "School"} | {edu.year || "Year"}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className={`text-2xl font-semibold mb-2 ${
              selectedTemplate === "modern" ? "text-blue-600 uppercase" :
              selectedTemplate === "minimalist" ? "font-light border-b border-gray-300 pb-1" :
              "text-gray-800 text-center"
            }`} style={{ fontSize: `${fontSize * 1.25}px` }}>Skills</h2>
            <div className="flex flex-wrap justify-center">
              {skills.map((skill, index) => (
                <span key={index} className={`bg-${selectedTemplate === "modern" ? "blue-200" : "gray-200"} text-${selectedTemplate === "modern" ? "blue-800" : "gray-800"} px-2 py-1 rounded mr-2 mb-2`}>{skill || "Skill"}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}