import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Button from './Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
`;

const UploadBox = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: ${props => props.isDragging ? '#f3f4f6' : 'transparent'};
  
  &:hover {
    border-color: #4f46e5;
    background-color: #f9fafb;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
`;

const ImagePreview = styled.div`
  margin-top: 16px;
  position: relative;
  width: 100%;
  
  img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background-color: white;
    color: #ef4444;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const LimitInfo = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const ImageUpload = ({ 
  label, 
  onChange, 
  currentImage,
  maxSize = 2 * 1024 * 1024, // 2MB in bytes
}) => {
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileInputRef = useRef(null);

  const validateImage = (file) => {
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Bitte wählen Sie eine gültige Bilddatei aus (JPEG, PNG, GIF, etc.).');
      return false;
    }
    
    // Check file size
    if (file.size > maxSize) {
      setError(`Die Bilddatei darf nicht größer als ${maxSize/1024/1024}MB sein.`);
      return false;
    }
    
    return true;
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Start with original dimensions
          let width = img.width;
          let height = img.height;
          let quality = 0.9; // Start with high quality
          
          // Create a canvas element
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Function to create blob and check size
          const createBlob = (quality) => {
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert canvas to blob with quality adjustment
            canvas.toBlob((blob) => {
              // If size is still too large and quality can be reduced further
              if (blob.size > maxSize && quality > 0.5) {
                // Reduce quality and try again
                quality -= 0.1;
                createBlob(quality);
              } 
              // If size is still too large, try reducing dimensions
              else if (blob.size > maxSize) {
                // Reduce dimensions by 10% and try again with original quality
                width = Math.floor(width * 0.9);
                height = Math.floor(height * 0.9);
                canvas.width = width;
                canvas.height = height;
                quality = 0.7; // Reset quality to a good balance
                createBlob(quality);
              } 
              // We've got a good size
              else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                
                setIsCompressing(false);
                resolve(compressedFile);
              }
            }, 'image/jpeg', quality);
          };
          
          // Start the compression process
          createBlob(quality);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file) => {
    if (!file) return;
    
    if (!validateImage(file)) {
      return;
    }
    
    try {
      // If file size is already below the limit, no need to compress large images
      if (file.size < maxSize * 0.9) { // Leave some margin
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
        onChange(file);
        return;
      }
      
      // Compress the image to reduce file size
      const compressedFile = await compressImage(file);
      
      // Use the compressed file
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(previewUrl);
      setError(null);
      onChange(compressedFile);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Fehler bei der Bildverarbeitung. Bitte versuchen Sie es erneut.');
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    processFile(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    processFile(file);
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}
      
      {!previewUrl ? (
        <UploadBox 
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <p>Klicke oder ziehe ein Bild hierher</p>
          <Button type="button" disabled={isCompressing}>
            {isCompressing ? 'Verarbeite...' : 'Durchsuchen...'}
          </Button>
          <LimitInfo>
            Maximale Größe: {maxSize/1024/1024}MB
          </LimitInfo>
          <FileInput 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isCompressing}
          />
        </UploadBox>
      ) : (
        <ImagePreview>
          <img src={previewUrl} alt="Vorschau" />
          <RemoveButton onClick={handleRemoveImage} type="button">×</RemoveButton>
        </ImagePreview>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default ImageUpload; 