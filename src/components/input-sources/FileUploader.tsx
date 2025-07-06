// src/components/input-sources/FileUploader.tsx - Apple Design System
import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react'

interface FileUploaderProps {
  onFileSelect?: (file: File) => void
  onFileUpload?: (file: File) => Promise<any>
  acceptedTypes?: string[]
  maxSize?: number // in MB
  multiple?: boolean
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  result?: any
  error?: string
}

const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, color: 'text-red-600', bg: 'bg-red-100', name: 'PDF' },
  'application/msword': { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', name: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', name: 'DOCX' },
  'text/plain': { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', name: 'TXT' },
  'application/vnd.ms-powerpoint': { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', name: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', name: 'PPTX' },
  'image/jpeg': { icon: Image, color: 'text-green-600', bg: 'bg-green-100', name: 'JPG' },
  'image/png': { icon: Image, color: 'text-green-600', bg: 'bg-green-100', name: 'PNG' },
  'image/gif': { icon: Image, color: 'text-green-600', bg: 'bg-green-100', name: 'GIF' },
  'video/mp4': { icon: Video, color: 'text-purple-600', bg: 'bg-purple-100', name: 'MP4' },
  'video/quicktime': { icon: Video, color: 'text-purple-600', bg: 'bg-purple-100', name: 'MOV' },
  'audio/mpeg': { icon: Music, color: 'text-pink-600', bg: 'bg-pink-100', name: 'MP3' },
  'audio/wav': { icon: Music, color: 'text-pink-600', bg: 'bg-pink-100', name: 'WAV' }
}

export default function AppleFileUploader({
  onFileSelect,
  onFileUpload,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.mp3', '.wav'],
  maxSize = 10,
  multiple = false,
  disabled = false,
  className = ''
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileInfo = (file: File) => {
    const typeInfo = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    return typeInfo || { icon: File, color: 'text-gray-600', bg: 'bg-gray-100', name: 'FILE' }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = useCallback((file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`
    }

    // Check file type if acceptedTypes is specified
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isAccepted = acceptedTypes.some(type => 
        type.toLowerCase() === fileExtension || 
        file.type.includes(type.replace('.', ''))
      )
      if (!isAccepted) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }, [maxSize, acceptedTypes])

  const handleFileSelection = useCallback(async (files: FileList) => {
    if (disabled) return

    const selectedFiles = Array.from(files)
    
    for (const file of selectedFiles) {
      const validationError = validateFile(file)
      
      const uploadedFile: UploadedFile = {
        file,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        status: validationError ? 'error' : 'uploading',
        progress: validationError ? 0 : 0,
        error: validationError || undefined
      }

      setUploadedFiles(prev => [...prev, uploadedFile])

      // Call onFileSelect callback
      if (!validationError && onFileSelect) {
        onFileSelect(file)
      }

      // Handle upload if onFileUpload is provided
      if (!validationError && onFileUpload) {
        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadedFile.id ? { ...f, progress } : f
              )
            )
          }

          // Perform actual upload
          const result = await onFileUpload(file)
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'success', progress: 100, result }
                : f
            )
          )
        } catch (error) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { 
                    ...f, 
                    status: 'error', 
                    error: error instanceof Error ? error.message : 'Upload failed' 
                  }
                : f
            )
          )
        }
      } else if (!validationError) {
        // Mark as success if no upload handler
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        )
      }
    }
  }, [disabled, onFileSelect, onFileUpload, validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [handleFileSelection])

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-black' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 ${isDragOver ? 'text-white' : 'text-apple-gray'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-black mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Files'}
            </h3>
            <p className="text-sm text-apple-gray mb-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-apple-gray">
              Supported: {acceptedTypes.slice(0, 4).join(', ')}
              {acceptedTypes.length > 4 && ` +${acceptedTypes.length - 4} more`} • Max {maxSize}MB
            </p>
          </div>
          
          <button
            type="button"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
            disabled={disabled}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-black">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => {
              const fileInfo = getFileInfo(uploadedFile.file)
              const Icon = fileInfo.icon
              
              return (
                <div
                  key={uploadedFile.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    {/* File Icon */}
                    <div className={`w-12 h-12 ${fileInfo.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${fileInfo.color}`} />
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-sm font-medium text-black truncate">
                          {uploadedFile.file.name}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fileInfo.bg} ${fileInfo.color}`}>
                          {fileInfo.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-apple-gray">
                        <span>{formatFileSize(uploadedFile.file.size)}</span>
                        {uploadedFile.status === 'uploading' && (
                          <span>Uploading... {uploadedFile.progress}%</span>
                        )}
                        {uploadedFile.status === 'success' && (
                          <span className="text-green-600 font-medium">✅ Uploaded successfully</span>
                        )}
                        {uploadedFile.status === 'error' && (
                          <span className="text-red-600 font-medium">❌ {uploadedFile.error}</span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {uploadedFile.status === 'uploading' && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-black h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {uploadedFile.status === 'uploading' && (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(uploadedFile.id)
                      }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-apple-gray hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {uploadedFiles.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: '.pdf', icon: FileText, label: 'PDF Documents', color: 'text-red-600', bg: 'bg-red-50' },
            { type: '.docx', icon: FileText, label: 'Word Docs', color: 'text-blue-600', bg: 'bg-blue-50' },
            { type: '.jpg,.png', icon: Image, label: 'Images', color: 'text-green-600', bg: 'bg-green-50' },
            { type: '.mp4', icon: Video, label: 'Videos', color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((quickAction, index) => {
            const Icon = quickAction.icon
            return (
              <button
                key={index}
                onClick={openFileDialog}
                disabled={disabled}
                className={`p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-center ${quickAction.bg} hover:bg-opacity-80`}
              >
                <Icon className={`h-6 w-6 ${quickAction.color} mx-auto mb-2`} />
                <div className="text-xs font-medium text-black">{quickAction.label}</div>
              </button>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-black">
                {uploadedFiles.length}
              </div>
              <div className="text-xs text-apple-gray font-medium">Total Files</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {uploadedFiles.filter(f => f.status === 'success').length}
              </div>
              <div className="text-xs text-apple-gray font-medium">Successful</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-black">
                {formatFileSize(uploadedFiles.reduce((total, file) => total + file.file.size, 0))}
              </div>
              <div className="text-xs text-apple-gray font-medium">Total Size</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}