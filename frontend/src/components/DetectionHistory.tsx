import { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Pagination, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faFilter, 
  faSearch,
  faUserFriends,
  faCalendarAlt,
  faPercent,
  faSync,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import { getDetections, deleteDetection } from '@/utils/api';
import "react-datepicker/dist/react-datepicker.css";

interface DetectionHistoryProps {
  refresh: boolean;
}

export default function DetectionHistory({ refresh }: DetectionHistoryProps) {
  const [detections, setDetections] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPeople: '',
    maxPeople: '',
    minConfidence: '',
  });

  const [tempFilters, setTempFilters] = useState({
    minPeople: '',
    maxPeople: '',
    minConfidence: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchDetections = async () => {
    setIsLoading(true);
    try {
      const activeFilters = Object.entries(filters).reduce((acc: any, [key, value]) => {
        if (value !== '' && value !== null) {
          switch(key) {
            case 'minPeople':
              acc.min_people = parseInt(value as string);
              break;
            case 'maxPeople':
              acc.max_people = parseInt(value as string);
              break;
            case 'minConfidence':
              acc.min_confidence = parseFloat(value as string);
              break;
          }
        }
        return acc;
      }, {});

      const params = {
        skip: (page - 1) * 10,
        limit: 10,
        ...activeFilters
      };

      console.log('Fetching with params:', params);
      const data = await getDetections(params);
      setDetections(data.items);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [page, refresh, JSON.stringify(filters)]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this detection?')) {
      try {
        await deleteDetection(id);
        fetchDetections();
      } catch (error) {
        console.error('Failed to delete detection:', error);
      }
    }
  };

  const handleApplyFilters = () => {
    // Validate min/max people
    if (tempFilters.minPeople && tempFilters.maxPeople) {
      const min = parseInt(tempFilters.minPeople);
      const max = parseInt(tempFilters.maxPeople);
      if (min > max) {
        alert('Min people cannot be greater than max people');
        return;
      }
    }
    
    // Validate confidence
    if (tempFilters.minConfidence) {
      const conf = parseFloat(tempFilters.minConfidence);
      if (conf < 0 || conf > 1) {
        alert('Confidence must be between 0 and 1');
        return;
      }
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const resetFilters = () => {
    const emptyFilters = {
      minPeople: '',
      maxPeople: '',
      minConfidence: '',
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-primary"
          onClick={() => setShowFilters(!showFilters)}
          className="me-2"
        >
          <FontAwesomeIcon icon={faFilter} className="me-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        {showFilters && (
          <div>
            <Button 
              variant="success" 
              onClick={handleApplyFilters}
              className="me-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Filtering...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Apply Filters
                </>
              )}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={resetFilters}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {showFilters && (
        <Card className="mb-4 filter-card">
          <Card.Body>
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                      Min People
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={tempFilters.minPeople}
                      onChange={(e) => setTempFilters({
                        ...tempFilters, 
                        minPeople: e.target.value ? e.target.value : ''
                      })}
                      placeholder="Min"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                      Max People
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={tempFilters.maxPeople}
                      onChange={(e) => setTempFilters({
                        ...tempFilters, 
                        maxPeople: e.target.value ? e.target.value : ''
                      })}
                      placeholder="Max"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      <FontAwesomeIcon icon={faPercent} className="me-2" />
                      Min Confidence
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={tempFilters.minConfidence}
                      onChange={(e) => setTempFilters({
                        ...tempFilters, 
                        minConfidence: e.target.value ? e.target.value : ''
                      })}
                      placeholder="0.0 - 1.0"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Table striped bordered hover responsive className="align-middle">
        <thead>
          <tr>
            <th style={{width: '200px'}}>Time</th>
            <th style={{width: '120px'}}>People Count</th>
            <th style={{width: '120px'}}>Confidence</th>
            <th style={{width: '150px'}}>Processing Time</th>
            <th style={{width: '200px'}}>Image</th>
            <th style={{width: '250px'}}>Image Path</th>
            <th style={{width: '100px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {detections.map((detection) => (
            <tr key={detection.id}>
              <td className="text-nowrap">
                {new Date(detection.timestamp).toLocaleString()}
              </td>
              <td>
                <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                {detection.num_people}
              </td>
              <td>
                <FontAwesomeIcon icon={faPercent} className="me-2" />
                {(detection.confidence_score * 100).toFixed(2)}%
              </td>
              <td>
                <FontAwesomeIcon icon={faSync} className="me-2" />
                {detection.processing_time.toFixed(3)}s
              </td>
              <td className="text-center">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${detection.detected_image_path}`}
                  alt="Detected"
                  style={{ maxHeight: '100px', cursor: 'pointer' }}
                  onClick={() => window.open(
                    `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${detection.detected_image_path}`, 
                    '_blank'
                  )}
                />
              </td>
              <td className="text-break">
                <small>
                  {/* Original: {detection.original_image_path}<br/> */}
                  Detected: {detection.detected_image_path}
                </small>
              </td>
              <td className="text-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(detection.id)}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center">
        <Pagination>
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={idx + 1 === page}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
} 