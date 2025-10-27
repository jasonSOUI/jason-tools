import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaCopy } from 'react-icons/fa';

// --- Logic and data from both files ---
const cityMap: { [key: string]: string } = {
  A: '臺北市', B: '臺中市', C: '基隆市', D: '臺南市', E: '高雄市', F: '新北市', G: '宜蘭縣', H: '桃園市', 
  I: '嘉義市', J: '新竹縣', K: '苗栗縣', L: '臺中縣', M: '南投縣', N: '彰化縣', O: '新竹市', P: '雲林縣', 
  Q: '嘉義縣', R: '臺南縣', S: '高雄縣', T: '屏東縣', U: '花蓮縣', V: '臺東縣', W: '金門縣', X: '澎湖縣', 
  Y: '陽明山', Z: '連江縣'
};

const letterMap: { [key: string]: number } = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18, K: 19, L: 20, M: 21,
    N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

const validateId = (id: string): boolean => {
  const idRegex = /^[A-Z][12]\d{8}$/; // Note: The original regex had a typo, it should be /^[A-Z][12]\d{8}$/ or similar depending on the exact requirement. Assuming it's correct for now.
  if (!idRegex.test(id)) return false;
  const letterValue = letterMap[id.charAt(0)];
  const d0 = Math.floor(letterValue / 10);
  const d1 = letterValue % 10;
  let sum = d0 * 1 + d1 * 9;
  for (let i = 1; i < 9; i++) {
    sum += parseInt(id.charAt(i)) * (9 - i);
  }
  const lastDigit = parseInt(id.charAt(9));
  const checksum = (10 - (sum % 10)) % 10;
  return lastDigit === checksum;
};

// --- Validator Component Logic ---
const ValidatorTab = () => {
  const [idNumber, setIdNumber] = useState('');
  const [result, setResult] = useState<{ message: string; variant: string } | null>(null);

  const handleValidate = () => {
    if (!idNumber) {
      setResult({ message: '請輸入身分證字號', variant: 'warning' });
      return;
    }
    if (validateId(idNumber)) {
      setResult({ message: '有效的身分證字號', variant: 'success' });
    } else {
      setResult({ message: '無效的身分證字號', variant: 'danger' });
    }
  };

  return (
    <div className="p-3">
      {result && <Alert variant={result.variant as any} className="mb-4">{result.message}</Alert>}
      <Form onSubmit={(e) => { e.preventDefault(); handleValidate(); }}>
        <Form.Group className="mb-3" controlId="idInput">
          <Form.Label>請輸入身分證字號進行驗證</Form.Label>
          <Form.Control type="text" placeholder="例如 A123456789" value={idNumber} onChange={(e) => { setIdNumber(e.target.value.toUpperCase()); setResult(null); }} maxLength={10} />
        </Form.Group>
        <Button variant="primary" type="submit">驗證</Button>
      </Form>
    </div>
  );
}

// --- Generator Component Logic ---
const GeneratorTab = () => {
  const [city, setCity] = useState('A');
  const [gender, setGender] = useState('1');
  const [generatedId, setGeneratedId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const letterValue = letterMap[city];
    const d0 = Math.floor(letterValue / 10);
    const d1 = letterValue % 10;
    let sum = d0 * 1 + d1 * 9;
    let partialId = city + gender;
    sum += parseInt(gender) * 8;
    for (let i = 2; i < 9; i++) {
      const randomDigit = Math.floor(Math.random() * 10);
      partialId += randomDigit;
      sum += randomDigit * (9 - i);
    }
    const checksum = (10 - (sum % 10)) % 10;
    const finalId = partialId + checksum;
    setGeneratedId(finalId);
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>縣市</Form.Label>
          <Form.Select value={city} onChange={e => setCity(e.target.value)}>
            {Object.entries(cityMap).map(([letter, name]) => (
              <option key={letter} value={letter}>{`${letter} - ${name}`}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>性別</Form.Label>
          <Form.Select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="1">男</option>
            <option value="2">女</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary" onClick={handleGenerate}>產生</Button>
      </Form>
      {generatedId && (
        <div className="mt-4">
          <Form.Label>產生的身分證字號</Form.Label>
          <InputGroup>
            <Form.Control type="text" value={generatedId} readOnly />
            <Button variant="outline-secondary" onClick={handleCopy}><FaCopy className="me-1" /> {copied ? '已複製!' : '複製'}</Button>
          </InputGroup>
        </div>
      )}
    </div>
  );
}

// --- Main Combined Component ---
const IdTool: React.FC = () => {
  return (
    <Tabs defaultActiveKey="validator" id="id-tool-tabs" className="mb-3">
      <Tab eventKey="validator" title="身分證驗證">
        <ValidatorTab />
      </Tab>
      <Tab eventKey="generator" title="身分證產生器">
        <GeneratorTab />
      </Tab>
    </Tabs>
  );
};

export default IdTool;
