import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

interface FileEntry {
  name: string;
  size: number;
}

interface ComparisonResult {
  name: string;
  originalSize: number | '-';
  modifiedSize: number | '-';
  difference: number | '-';
  status: string;
}

const FileSizeComparer: React.FC = () => {
  const [originalFiles, setOriginalFiles] = useState<FileEntry[]>([]);
  const [modifiedFiles, setModifiedFiles] = useState<FileEntry[]>([]);
  const [originalFilesCount, setOriginalFilesCount] = useState(0);
  const [modifiedFilesCount, setModifiedFilesCount] = useState(0);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'modified') => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) {
      if (type === 'original') {
        setOriginalFiles([]);
        setOriginalFilesCount(0);
      } else {
        setModifiedFiles([]);
        setModifiedFilesCount(0);
      }
      return;
    }

    const fileList: FileEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileList.push({ name: file.name, size: file.size });
    }

    if (type === 'original') {
      setOriginalFiles(fileList);
      setOriginalFilesCount(fileList.length);
    } else {
      setModifiedFiles(fileList);
      setModifiedFilesCount(fileList.length);
    }
  };

  const handleCompare = () => {
    setError(null);
    setComparisonResults([]);

    if (originalFiles.length === 0 && modifiedFiles.length === 0) {
      setError('請至少選擇一組檔案進行比對。');
      return;
    }

    const results: ComparisonResult[] = [];
    const originalMap = new Map<string, number>();
    originalFiles.forEach(file => originalMap.set(file.name, file.size));

    const modifiedMap = new Map<string, number>();
    modifiedFiles.forEach(file => modifiedMap.set(file.name, file.size));

    // Compare files present in original
    for (const originalFile of originalFiles) {
      const modifiedSize = modifiedMap.get(originalFile.name);
      if (modifiedSize !== undefined) {
        // File exists in both
        const diff = modifiedSize - originalFile.size;
        results.push({
          name: originalFile.name,
          originalSize: originalFile.size,
          modifiedSize: modifiedSize,
          difference: diff,
          status: diff > 0 ? '增加' : (diff < 0 ? '減少' : '相同'),
        });
      } else {
        // File deleted
        results.push({
          name: originalFile.name,
          originalSize: originalFile.size,
          modifiedSize: '-',
          difference: '-',
          status: '刪除',
        });
      }
    }

    // Add new files present only in modified
    for (const modifiedFile of modifiedFiles) {
      if (!originalMap.has(modifiedFile.name)) {
        results.push({
          name: modifiedFile.name,
          originalSize: '-',
          modifiedSize: modifiedFile.size,
          difference: '-',
          status: '新增',
        });
      }
    }

    setComparisonResults(results);
  };

  return (
    <div>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="originalFiles" className="mb-2">
            <Form.Label>原始檔案</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e, 'original')}
            />
            <Form.Text className="text-muted">已選擇: {originalFilesCount} 個檔案</Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="modifiedFiles" className="mb-2">
            <Form.Label>修改後檔案</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e, 'modified')}
            />
            <Form.Text className="text-muted">已選擇: {modifiedFilesCount} 個檔案</Form.Text>
          </Form.Group>
        </Col>
      </Row>
      <Button onClick={handleCompare}>比對檔案大小</Button>

      {comparisonResults.length > 0 && (
        <div className="mt-4">
          <h5>比對結果</h5>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>檔名</th>
                <th>原始大小 (Bytes)</th>
                <th>修改後大小 (Bytes)</th>
                <th>差異 (Bytes)</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {comparisonResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.name}</td>
                  <td>{result.originalSize}</td>
                  <td>{result.modifiedSize}</td>
                  <td>{result.difference}</td>
                  <td>{result.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FileSizeComparer;
