import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import { FaTrash } from 'react-icons/fa';

interface AnalysisResult {
  originalUrl: string;
  transformedUrl: string;
  params: { key: string; value: string }[];
  timestamp: string;
  displayText: string;
  notes: string; // Add notes field
}

const NBUrlParser: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [notes, setNotes] = useState(''); // State for notes
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('nbUrlHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('nbUrlHistory');
    }
  }, []);

  const updateHistory = (newResult: AnalysisResult) => {
    const newHistory = [newResult, ...history.filter(h => h.originalUrl !== newResult.originalUrl)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('nbUrlHistory', JSON.stringify(newHistory));
  };

  const handleAnalyze = () => {
    if (!inputUrl.startsWith('https://')) {
      alert('請輸入一個有效的 HTTPS 網址');
      return;
    }

    try {
      const url = new URL(inputUrl);
      const transformedUrl = inputUrl.replace('https://vtwlifepolicyadminsit.pru.intranet.asia', 'http://localhost:8080');
      
      const params: { key: string; value: string }[] = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });

      const applNumParam = params.find(p => p.key === 'applNum');
      const displayText = applNumParam && applNumParam.value ? applNumParam.value : '新案件';

      const result: AnalysisResult = {
        originalUrl: inputUrl,
        transformedUrl,
        params,
        timestamp: new Date().toLocaleString(),
        displayText: displayText,
        notes: notes, // Save notes
      };

      setAnalysisResult(result);
      updateHistory(result);

    } catch (error) {
      alert('無法解析網址，請確認格式是否正確');
    }
  };

  const handleHistoryClick = (item: AnalysisResult) => {
    setInputUrl(item.originalUrl);
    setNotes(item.notes); // Populate notes from history
    setAnalysisResult(item);
  };

  const handleDeleteOne = (e: React.MouseEvent, urlToDelete: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.originalUrl !== urlToDelete);
    setHistory(newHistory);
    localStorage.setItem('nbUrlHistory', JSON.stringify(newHistory));
  };

  const handleDeleteAll = () => {
    if (window.confirm('確定要清除所有歷史紀錄嗎？')) {
      setHistory([]);
      localStorage.removeItem('nbUrlHistory');
      setAnalysisResult(null);
      setInputUrl('');
      setNotes(''); // Clear notes
    }
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <Form.Group className="mb-3">
          <Form.Label>請輸入網址</Form.Label>
          <Form.Control as="textarea" rows={5} value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="貼上 NB 相關網址..." />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>備註</Form.Label>
          <Form.Control type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="請輸入備註..." />
        </Form.Group>
        <Button onClick={handleAnalyze}>分析網址</Button>

        {analysisResult && (
          <div className="mt-4">
            <h5>轉換後連結</h5>
            <Alert variant="success">
              <a href={analysisResult.transformedUrl} target="_blank" rel="noopener noreferrer">{analysisResult.transformedUrl}</a>
            </Alert>
            
            {analysisResult.notes && (
              <div className="mt-3">
                <h5>備註</h5>
                <p>{analysisResult.notes}</p>
              </div>
            )}

            <h5 className="mt-4">參數分析</h5>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>參數 (Key)</th>
                  <th>數值 (Value)</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.params.map(({ key, value }, index) => (
                  <tr key={index}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
      <div className="col-md-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5>歷史紀錄</h5>
          {history.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={handleDeleteAll}>全部清除</Button>
          )}
        </div>
        {history.length > 0 ? (
          <ListGroup>
            {history.map((item, index) => (
              <ListGroup.Item key={index} action className="d-flex justify-content-between align-items-center" onClick={() => handleHistoryClick(item)}>
                <div className="me-auto">
                  <div className="fw-bold">{item.displayText}</div>
                  {item.notes && <div className="text-muted"><small>{item.notes}</small></div>}
                  <small className="text-muted">{item.timestamp}</small>
                </div>
                <Button variant="light" size="sm" onClick={(e) => handleDeleteOne(e, item.originalUrl)}>
                  <FaTrash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">尚無歷史紀錄。</p>
        )}
      </div>
    </div>
  );
};

export default NBUrlParser;
