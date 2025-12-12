'use client'

import React, { useState, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CustomUploadProps {
  path: string
  required?: boolean
}

export const CustomUpload: React.FC<CustomUploadProps> = ({ path, required }) => {
  const { value, setValue } = useField({ path })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only images are allowed.')
        return
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB')
        return
      }

      setUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            setValue(response.doc)
            setUploadProgress(100)
          } else {
            throw new Error('Upload failed')
          }
          setUploading(false)
        })

        xhr.addEventListener('error', () => {
          alert('Upload failed')
          setUploading(false)
          setUploadProgress(0)
        })

        xhr.open('POST', '/api/upload')
        xhr.withCredentials = true
        xhr.send(formData)
      } catch (error) {
        console.error('Upload error:', error)
        alert('Upload failed')
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [setValue],
  )

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {value && typeof value === 'object' && value && (value as any).url && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Current file:</p>
            <div className="flex items-center space-x-2">
              {(value as any).url && (
                <img
                  src={(value as any).url as string}
                  alt={((value as any).alt as string) || 'Uploaded image'}
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm">
                  {((value as any).filename as string) || ((value as any).alt as string)}
                </p>
                <p className="text-xs text-gray-500">
                  {(value as any).filesize &&
                    `${(((value as any).filesize as number) / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setValue(null)}>
                Remove
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Upload Image {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
          <p>• Maximum file size: 50MB</p>
          <p>• Files are uploaded directly to cloud storage</p>
        </div>
      </div>
    </Card>
  )
}
