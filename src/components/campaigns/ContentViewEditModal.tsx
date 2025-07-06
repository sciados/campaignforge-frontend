'use client'
import React, { useState, useEffect, useRef } from 'react'
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

// Auto-expanding textarea component
const AutoExpandingTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  minRows = 3 
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minRows?: number
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const minHeight = lineHeight * minRows
      const newHeight = Math.max(textarea.scrollHeight, minHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [minRows])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        setTimeout(adjustHeight, 0)
      }}
      placeholder={placeholder}
      className={`resize-none overflow-hidden ${className}`}
      style={{ minHeight: `${minRows * 1.5}rem` }}
    />
  )
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
      let contentToSave = editedContent

      // If we have individual edits, merge them back into the content structure
      if (Object.keys(individualEdits).length > 0 && content.parsed_content) {
        console.log('🔄 Merging individual edits back into structured content')
        
        const updatedContent = { ...content.parsed_content }
        
        // Handle different content types
        if (content.content_type === 'email_sequence' && updatedContent.emails) {
          Object.entries(individualEdits).forEach(([index, newContent]) => {
            const emailIndex = parseInt(index)
            if (updatedContent.emails[emailIndex]) {
              updatedContent.emails[emailIndex].body = newContent
            }
          })
          contentToSave = JSON.stringify(updatedContent)
        } else if ((content.content_type === 'social_media_posts' || content.content_type === 'SOCIAL_POSTS') && updatedContent.posts) {
          Object.entries(individualEdits).forEach(([index, newContent]) => {
            const postIndex = parseInt(index)
            if (updatedContent.posts[postIndex]) {
              updatedContent.posts[postIndex].content = newContent
            }
          })
          contentToSave = JSON.stringify(updatedContent)
        } else if (content.content_type === 'ad_copy' && updatedContent.ads) {
          Object.entries(individualEdits).forEach(([index, newContent]) => {
            const adIndex = parseInt(index)
            if (updatedContent.ads[adIndex]) {
              // For ads, we need to parse the markdown-style content back
              const lines = newContent.split('\n').filter(line => line.trim())
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('**') && lines[i].endsWith('**')) {
                  updatedContent.ads[adIndex].headline = lines[i].replace(/\*\*/g, '')
                } else if (lines[i].startsWith('*CTA:')) {
                  updatedContent.ads[adIndex].cta = lines[i].replace('*CTA: ', '').replace('*', '')
                } else if (!lines[i].includes(':') && lines[i].length > 20) {
                  updatedContent.ads[adIndex].body = lines[i]
                }
              }
            }
          })
          contentToSave = JSON.stringify(updatedContent)
        }
        
        console.log('✅ Merged content structure:', {
          original_edits: Object.keys(individualEdits).length,
          merged_content_length: contentToSave.length
        })
      }

      console.log('💾 Saving content:', {
        contentId: content.id,
        contentType: content.content_type,
        hasIndividualEdits: Object.keys(individualEdits).length > 0,
        contentLength: contentToSave.length,
        preview: contentToSave.substring(0, 100)
      })

      await onSave(content.id, contentToSave)
      
      setHasChanges(false)
      setIsEditing(false)
      setIndividualEdits({})
      
      console.log('✅ Content saved successfully')
      
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      // TODO: Show error toast to user
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
      <div className="space-y-6">
        {/* Single Item Header */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-black text-lg mb-3">{item.title}</h4>
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {isEditing ? (
            <AutoExpandingTextarea
              value={editContent}
              onChange={(newContent) => handleIndividualEdit(0, newContent)}
              placeholder="Edit your content here..."
              className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm"
              minRows={8}
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
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-6 bg-gray-50 rounded-lg p-4">
          <span className="font-medium">{content.formatted_content.length} items</span>
          <span className="ml-2">• Click to expand and edit individual sections</span>
        </div>
        
        {content.formatted_content.map((item: any, index: number) => {
          const isExpanded = expandedItems.has(index)
          const editContent = individualEdits[index] || item.content
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleItemExpansion(index)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-black">{item.title}</h4>
                  {item.metadata?.preview && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {item.metadata.preview}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {individualEdits[index] && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
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
                    <div className="px-6 py-4 bg-gray-25 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">
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
                  <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-black">
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
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <AutoExpandingTextarea
                          value={editContent}
                          onChange={(newContent) => handleIndividualEdit(index, newContent)}
                          placeholder="Edit this section..."
                          className="w-full p-4 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                          minRows={4}
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
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 text-lg">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-2">Content Not Available</h4>
          <p className="text-amber-700 text-sm mb-4">
            {content.parse_result?.error || 'Content could not be loaded'}
          </p>
          
          {content.parse_result?.isEmpty && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium mb-1">🔧 Recommended Action:</p>
              <p className="text-blue-700 text-sm">{content.parse_result.suggestion}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onClose()
                // TODO: Navigate to generate more content
              }}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
            >
              🔄 Regenerate Content
            </button>
            <button
              onClick={onRefresh}
              className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              🔍 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-light text-black flex items-center">
              {content.title}
              {(content.is_amplified || content.is_amplified_content) && (
                <span className="ml-2 text-blue-600">🚀</span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatContentType(content.content_type)}
              {content.confidence_score && (
                <span className="ml-2 text-blue-600">
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
          
          <div className="flex items-center space-x-3">
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
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isSaving}
                    >
                      <Undo className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
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
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Published
                </span>
              )}
              {content.is_amplified_content && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center font-medium">
                  <Zap className="h-3 w-3 mr-1" />
                  Amplified
                </span>
              )}
            </div>
            
            {hasChanges && (
              <span className="text-blue-600 text-sm font-medium">
                {Object.keys(individualEdits).length > 0 
                  ? `${Object.keys(individualEdits).length} section(s) edited`
                  : 'Unsaved changes'
                }
              </span>
            )}
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {content.type === 'intelligence' ? (
            <div className="space-y-6">
              {/* Intelligence Source Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-black mb-4">Source Information</h3>
                {content.source_url && (
                  <div className="mb-3">
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
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-black mb-4">Intelligence Data</h3>
                {isEditing ? (
                  <AutoExpandingTextarea
                    value={editedContent}
                    onChange={(newContent) => handleGlobalEdit(newContent)}
                    placeholder="Edit intelligence data..."
                    className="w-full p-4 bg-gray-100 border-none rounded-lg font-mono text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    minRows={15}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
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
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {content.type === 'intelligence' 
                ? `Intelligence source with analysis data`
                : hasValidContent
                  ? `Generated content with ${content.formatted_content?.length || 0} section${content.formatted_content?.length !== 1 ? 's' : ''}`
                  : `Content item (${content.parse_result?.error || 'parsing failed'})`
              }
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Copy className="h-4 w-4" />
                <span>Copy All</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
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