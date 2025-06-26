// src/components/ContentViewEditModal.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { 
  X, 
  Edit3, 
  Save, 
  Undo, 
  Copy, 
  Download,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react'

interface ContentViewEditModalProps {
  content: any
  isOpen: boolean
  onClose: () => void
  onSave: (contentId: string, newContent: string) => Promise<void>
  onRefresh: () => void
  formatContentType: (type: string) => string
}

export default function ContentViewEditModal({
  content,
  isOpen,
  onClose,
  onSave,
  onRefresh,
  formatContentType
}: ContentViewEditModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [individualEdits, setIndividualEdits] = useState<Record<number, string>>({})

  // Reset state when modal opens/closes or content changes
  useEffect(() => {
    if (isOpen && content) {
      setIsEditing(false)
      setHasChanges(false)
      setExpandedItems(new Set([0])) // Expand first item by default
      setIndividualEdits({})
      
      if (content.type === 'intelligence') {
        setEditedContent(JSON.stringify(content.data, null, 2))
      } else {
        setEditedContent(content.editable_text || content.raw_content_body || 'No content available')
      }
    }
  }, [isOpen, content])

  if (!isOpen || !content) return null

  const isMultipleItems = content.formatted_content && content.formatted_content.length > 1
  const hasValidContent = content.has_valid_content && content.formatted_content?.length > 0

  const toggleItemExpansion = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const handleIndividualEdit = (index: number, newContent: string) => {
    setIndividualEdits(prev => ({
      ...prev,
      [index]: newContent
    }))
    setHasChanges(true)
  }

  const handleGlobalEdit = (newContent: string) => {
    setEditedContent(newContent)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges) return
    
    setIsSaving(true)
    try {
      // For now, use the global edited content
      // In a real implementation, you'd merge individual edits back into the structured format
      await onSave(content.id, editedContent)
      setHasChanges(false)
      setIsEditing(false)
      setIndividualEdits({})
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      let textContent = `${content.title}\n\nType: ${formatContentType(content.content_type)}\n\n`
      
      if (content.is_amplified_content) {
        textContent += `🚀 Generated from AMPLIFIED Intelligence\n\n`
      }
      
      textContent += content.editable_text || JSON.stringify(content.parsed_content, null, 2)
      
      await navigator.clipboard.writeText(textContent)
      
      // TODO: Show success toast
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleDownload = () => {
    let textContent = `${content.title}\n`
    textContent += `${'='.repeat(50)}\n\n`
    textContent += `Type: ${formatContentType(content.content_type)}\n`
    textContent += `Created: ${new Date(content.created_at).toLocaleDateString()}\n`
    textContent += `Amplified Intelligence: ${content.is_amplified_content ? 'Yes' : 'No'}\n\n`
    textContent += content.editable_text || JSON.stringify(content.parsed_content, null, 2)
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderSingleItemView = () => {
    const item = content.formatted_content[0]
    const editContent = individualEdits[0] || item.content
    
    return (
      <div className="space-y-4">
        {/* Single Item Header */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 text-lg mb-2">{item.title}</h4>
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Single Item Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => handleIndividualEdit(0, e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Edit your content here..."
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {item.content}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAccordionView = () => {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600 mb-4">
          {content.formatted_content.length} items • Click to expand and edit individual sections
        </div>
        
        {content.formatted_content.map((item: any, index: number) => {
          const isExpanded = expandedItems.has(index)
          const editContent = individualEdits[index] || item.content
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleItemExpansion(index)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  {item.metadata?.preview && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {item.metadata.preview}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {individualEdits[index] && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Edited
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {/* Metadata */}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="px-4 py-3 bg-gray-25 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-gray-500 text-xs uppercase tracking-wide">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="text-gray-700 font-medium">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Edit Content:
                          </label>
                          {individualEdits[index] && (
                            <button
                              onClick={() => {
                                const newEdits = { ...individualEdits }
                                delete newEdits[index]
                                setIndividualEdits(newEdits)
                                if (Object.keys(newEdits).length === 0) {
                                  setHasChanges(false)
                                }
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => handleIndividualEdit(index, e.target.value)}
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Edit this section..."
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                        {item.content}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderErrorView = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 text-lg">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-2">Content Not Available</h4>
          <p className="text-amber-700 text-sm mb-3">
            {content.parse_result?.error || 'Content could not be loaded'}
          </p>
          
          {content.parse_result?.isEmpty && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <p className="text-blue-800 text-sm font-medium mb-1">🔧 Recommended Action:</p>
              <p className="text-blue-700 text-sm">{content.parse_result.suggestion}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={() => {
                onClose()
                // TODO: Navigate to generate more content
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              🔄 Regenerate Content
            </button>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              🔍 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {content.title}
              {(content.is_amplified || content.is_amplified_content) && (
                <span className="ml-2 text-purple-600">🚀</span>
              )}
            </h2>
            <p className="text-sm text-gray-500">
              {formatContentType(content.content_type)}
              {content.confidence_score && (
                <span className="ml-2 text-purple-600">
                  Confidence: {Math.round(content.confidence_score * 100)}%
                </span>
              )}
              {hasValidContent && isMultipleItems && (
                <span className="ml-2 text-gray-600">
                  • {content.formatted_content.length} items
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {content.type === 'generated_content' && hasValidContent && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setHasChanges(false)
                        setIndividualEdits({})
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isSaving}
                    >
                      <Undo className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Information Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Created: {new Date(content.created_at).toLocaleDateString()}
              </span>
              {content.user_rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{content.user_rating}</span>
                </div>
              )}
              {content.is_published && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Published
                </span>
              )}
              {content.is_amplified_content && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Amplified
                </span>
              )}
            </div>
            
            {hasChanges && (
              <span className="text-orange-600 text-sm font-medium">
                {Object.keys(individualEdits).length > 0 
                  ? `${Object.keys(individualEdits).length} section(s) edited`
                  : 'Unsaved changes'
                }
              </span>
            )}
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {content.type === 'intelligence' ? (
            <div className="space-y-6">
              {/* Intelligence Source Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Source Information</h3>
                {content.source_url && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">URL: </span>
                    <a 
                      href={content.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      {content.source_url}
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Confidence: </span>
                    <span className="font-medium">{Math.round(content.confidence_score * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type: </span>
                    <span className="font-medium">{formatContentType(content.content_type)}</span>
                  </div>
                </div>
              </div>

              {/* Intelligence Data */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Intelligence Data</h3>
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => handleGlobalEdit(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                    {JSON.stringify(content.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ) : hasValidContent ? (
            isMultipleItems ? renderAccordionView() : renderSingleItemView()
          ) : (
            renderErrorView()
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {content.type === 'intelligence' 
                ? `Intelligence source with analysis data`
                : hasValidContent
                  ? `Generated content with ${content.formatted_content?.length || 0} section${content.formatted_content?.length !== 1 ? 's' : ''}`
                  : `Content item (${content.parse_result?.error || 'parsing failed'})`
              }
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copy All</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}