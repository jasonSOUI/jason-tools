import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ListGroup from 'react-bootstrap/ListGroup';
import { FaTrash, FaCopy } from 'react-icons/fa';

interface GenerationResult {
  baseName: string;
  generatedNames: string[];
  timestamp: string;
}

const SUFFIXES = ['_NB006', '_NB007', '_NB011', '_NB015', '_AFI009', '_AFI010'];

const ScanCaseGenerator: React.FC = () => {
  const [baseName, setBaseName] = useState('');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [copyAllText, setCopyAllText] = useState('全部複製');

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('scanCaseHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('scanCaseHistory');
    }
  }, []);

  const updateHistory = (newResult: GenerationResult) => {
    const newHistory = [newResult, ...history.filter(h => h.baseName !== newResult.baseName)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('scanCaseHistory', JSON.stringify(newHistory));
  };

  const handleGenerate = () => {
    if (!baseName.trim()) {
      alert('請輸入案件名稱');
      return;
    }
    const generatedNames = SUFFIXES.map(suffix => `${baseName}${suffix}`);
    const result: GenerationResult = {
      baseName,
      generatedNames,
      timestamp: new Date().toLocaleString(),
    };
    setGenerationResult(result);
    updateHistory(result);
  };

  const handleHistoryClick = (item: GenerationResult) => {
    setBaseName(item.baseName);
    setGenerationResult(item);
  };

  const handleDeleteOne = (e: React.MouseEvent, nameToDelete: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.baseName !== nameToDelete);
    setHistory(newHistory);
    localStorage.setItem('scanCaseHistory', JSON.stringify(newHistory));
  };

  const handleDeleteAll = () => {
    if (window.confirm('確定要清除所有歷史紀錄嗎？')) {
      setHistory([]);
      localStorage.removeItem('scanCaseHistory');
      setGenerationResult(null);
      setBaseName('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyAll = () => {
    if (generationResult) {
      const allNames = generationResult.generatedNames.join('\n');
      navigator.clipboard.writeText(allNames);
      setCopyAllText('已複製!');
      setTimeout(() => setCopyAllText('全部複製'), 2000);
    }
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <Form.Group className="mb-3">
          <Form.Label>請輸入案件名稱</Form.Label>
          <Form.Control type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder="貼上案件名稱..." />
        </Form.Group>
        <Button onClick={handleGenerate}>產生列表</Button>

        {generationResult && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">產生結果</h5>
              <Button variant="success" size="sm" onClick={handleCopyAll}>{copyAllText}</Button>
            </div>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>完整檔名</th>
                  <th style={{ width: '100px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {generationResult.generatedNames.map((name, index) => (
                  <tr key={index}>
                    <td>{name}</td>
                    <td><Button variant="outline-secondary" size="sm" onClick={() => handleCopy(name)}><FaCopy className="me-1" /> 複製</Button></td>
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
                  <div className="fw-bold">{item.baseName}</div>
                  <small className="text-muted">{item.timestamp}</small>
                </div>
                <Button variant="light" size="sm" onClick={(e) => handleDeleteOne(e, item.baseName)}>
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

export default ScanCaseGenerator;
