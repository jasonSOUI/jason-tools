import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// Helper to format date to YYYY-MM-DD for input
const toInputDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const InsuranceAgeCalculator: React.FC = () => {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(toInputDate(today));
  const [calcDate, setCalcDate] = useState(toInputDate(today));
  const [result, setResult] = useState<{ actualAge: number; insuranceAge: number } | null>(null);

  useEffect(() => {
    if (!birthDate || !calcDate) {
      setResult(null);
      return;
    }

    const bd = new Date(birthDate);
    const cd = new Date(calcDate);

    if (bd > cd) {
        setResult(null);
        return;
    }

    // 1. Calculate Actual Age
    let actualAge = cd.getFullYear() - bd.getFullYear();
    const thisYearBirthday = new Date(cd.getFullYear(), bd.getMonth(), bd.getDate());
    if (cd < thisYearBirthday) {
      actualAge--;
    }

    // 2. Calculate Insurance Age
    const lastBirthday = new Date(cd.getFullYear(), bd.getMonth(), bd.getDate());
    if (cd < lastBirthday) {
        lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
    }

    const sixMonthsAfterLastBirthday = new Date(lastBirthday.getTime());
    sixMonthsAfterLastBirthday.setMonth(sixMonthsAfterLastBirthday.getMonth() + 6);

    let insuranceAge = actualAge;
    if (cd > sixMonthsAfterLastBirthday) {
      insuranceAge++;
    }

    setResult({ actualAge, insuranceAge });

  }, [birthDate, calcDate]);

  return (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>出生日期</Form.Label>
            <Form.Control type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>計算日期</Form.Label>
            <Form.Control type="date" value={calcDate} onChange={(e) => setCalcDate(e.target.value)} />
          </Form.Group>
        </Col>
      </Row>

      {result !== null ? (
        <Alert variant="info" className="mt-3 text-center">
          <div className="fs-5">實際足歲: <strong className="mx-2">{result.actualAge}</strong> 歲</div>
          <hr />
          <div className="fs-4">保險年齡: <strong className="mx-2">{result.insuranceAge}</strong> 歲</div>
        </Alert>
      ) : (
        <Alert variant="warning" className="mt-3 text-center">
          請確認出生日期不可晚於計算日期。
        </Alert>
      )}
    </div>
  );
};

export default InsuranceAgeCalculator;
