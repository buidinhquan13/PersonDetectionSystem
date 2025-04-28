import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ImageUpload from '@/components/ImageUpload';
import DetectionHistory from '@/components/DetectionHistory';

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    setRefresh(!refresh);
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Person Detection System</h1>
      
      <Row>
        <Col lg={12}>
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Detection History</h2>
          <DetectionHistory refresh={refresh} />
        </Col>
      </Row>
    </Container>
  );
} 