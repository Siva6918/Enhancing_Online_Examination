import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import Webcam from '../student/Components/WebCam';
import { Button } from '@mui/material';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice'; // Adjust the import path
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router';

export default function Coder() {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [questionId, setQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const { examId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [cheatingLog, setCheatingLog] = useState({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    prohibitedObjectCount: 0,
    examId: examId,
    username: userInfo?.name || '',
    email: userInfo?.email || '',
  });

  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();

  useEffect(() => {
    if (userInfo) {
      setCheatingLog((prevLog) => ({
        ...prevLog,
        username: userInfo.name,
        email: userInfo.email,
      }));
    }
  }, [userInfo]);

  // Fetch coding question when component mounts
  useEffect(() => {
    const fetchCodingQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/coding/questions/exam/${examId}`);
        if (response.data.success && response.data.data) {
          setQuestionId(response.data.data._id);
          setQuestion(response.data.data);
          // Set initial code if there's a template or description
          if (response.data.data.description) {
            setCode(`// ${response.data.data.description}\n\n// Write your code here...`);
          }
        } else {
          toast.error('No coding question found for this exam. Please contact your teacher.');
        }
      } catch (error) {
        console.error('Error fetching coding question:', error);
        toast.error(error?.response?.data?.message || 'Failed to load coding question');
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      fetchCodingQuestion();
    }
  }, [examId]);

  const runCode = async () => {
    let apiUrl;
    switch (language) {
      case 'python':
        apiUrl = '/run-python';
        break;
      case 'java':
        apiUrl = '/run-java';
        break;
      case 'javascript':
        apiUrl = '/run-javascript';
        break;
      default:
        return;
    }

    try {
      const response = await axios.post(apiUrl, { code });
      console.log('API Response:', response.data); // Log the response for debugging
      setOutput(response.data); // Adjust based on actual response structure
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code.'); // Display error message
    }
  };

  const handleSubmit = async () => {
    console.log('Starting submission with questionId:', questionId);
    console.log('Current code:', code);
    console.log('Selected language:', language);

    if (!questionId) {
      toast.error('Question not loaded properly. Please try again.');
      return;
    }

    try {
      // First submit the code
      const codeSubmissionData = {
        code,
        language,
        questionId,
      };

      console.log('Submitting code with data:', codeSubmissionData);

      const response = await axios.post('/api/coding/submit', codeSubmissionData);
      console.log('Submission response:', response.data);

      if (response.data.success) {
        try {
          // Make sure we have the latest user info in the log
          const updatedLog = {
            ...cheatingLog,
            username: userInfo.name,
            email: userInfo.email,
            examId: examId,
          };

          // Save the cheating log
          console.log('Saving cheating log:', updatedLog);
          const logResult = await saveCheatingLogMutation(updatedLog).unwrap();
          console.log('Cheating log saved successfully:', logResult);

          toast.success('Test submitted successfully!');
          navigate('/success');
        } catch (cheatingLogError) {
          console.error('Error saving cheating log:', cheatingLogError);
          // Log more details about the error
          if (cheatingLogError.data) {
            console.error('Error details:', cheatingLogError.data);
          }
          if (cheatingLogError.status) {
            console.error('Error status:', cheatingLogError.status);
          }
          toast.error('Test submitted but failed to save monitoring logs');
          navigate('/success');
        }
      } else {
        console.error('Submission failed:', response.data);
        toast.error('Failed to submit code');
      }
    } catch (error) {
      console.error('Error during submission:', error.response?.data || error);
      toast.error(
        error?.response?.data?.message || error?.data?.message || 'Failed to submit test',
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading question...</div>
      ) : !question ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No coding question found for this exam. Please contact your teacher.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>{question.question}</h3>
            <p>{question.description}</p>
          </div>

          <select onChange={(e) => setLanguage(e.target.value)} value={language}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <div style={{ display: 'flex', position: 'relative' }}>
            <Editor
              height="450px"
              width="900px"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
            />
            <div style={{ position: 'absolute', right: '10px' }}>
              <Webcam
                style={{ height: '400px', width: '400px' }}
                cheatingLog={cheatingLog}
                updateCheatingLog={setCheatingLog}
              />
            </div>
          </div>

          <Button
            variant="contained"
            onClick={runCode}
            style={{ marginTop: '20px', padding: '10px', marginRight: '10px' }}
          >
            Run Code
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            style={{ marginTop: '20px', padding: '10px' }}
          >
            Submit Test
          </Button>

          <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
            <h4>Output:</h4>
            <pre>{output}</pre>
          </div>
        </>
      )}
    </div>
  );
}
