import { useState, useRef } from 'react';
import { Form, Button, Image, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage } from '@fortawesome/free-solid-svg-icons';
import { uploadImage } from '@/utils/api';

interface ImageUploadProps {
  onUploadSuccess: () => void;
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedImageUrl, setDetectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL preview cho file đã chọn
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDetectedImageUrl(null); // Reset detected image khi chọn file mới
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await uploadImage(formData);
      
      // Hiển thị ảnh đã detect
      const detectedUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${response.detected_image_path}`;
      setDetectedImageUrl(detectedUrl);
      
      onUploadSuccess();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Choose an image to detect people</Form.Label>
        <Form.Control
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </Form.Group>

      {/* Preview area */}
      <div className="text-center mb-3">
        {(previewUrl || detectedImageUrl) && (
          <div>
            <Image
              src={detectedImageUrl || previewUrl || ''}
              alt="Preview"
              style={{ 
                maxHeight: '300px', 
                maxWidth: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '5px'
              }}
            />
          </div>
        )}
      </div>

      <div className="d-flex gap-2">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Uploading...
            </>
          ) : (
            'Upload & Detect'
          )}
        </Button>

        <Button
          variant="outline-secondary"
          onClick={handleReset}
          disabled={isUploading}
        >
          Reset
        </Button>
      </div>
    </div>
  );
} 