import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Camera,
  Send,
  Wrench,
  Search,
  Hammer,
  Bookmark,
  Check,
  ArrowUpRight,
  Plus,
  MessageCircle,
  Trash2,
  X,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RequirementsPanel } from '../RequirementsPanel'
import type { Requirements } from '../matching'
import { areaText, listingArea } from '../matching'
import type {
  Listing,
  AgentSkill,
  ChatMessage,
  ConversationSession
} from './types'
import { AVAILABLE_SKILLS, executeAgentSkill } from './skillEngine'
import './AgentChat.css'

interface AgentChatProps {
  items: Listing[]
  saved: number[]
  onToggleSave: (id: number) => void
  onSelectItem: (item: Listing) => void
  onViewProject: () => void
  onBeginList: () => void
  requirements: Requirements
  onRequirementsChange: (r: Requirements) => void
  ready: boolean
  onConfirmRequirements: () => void
  onEditRequirements: () => void
}

const SAMPLE_PHOTO_TILE = 'https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?w=500&auto=format&fit=crop&q=80'
const SAMPLE_PHOTO_POT = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80'
const SAMPLE_PHOTO_WOOD = 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=80'

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  timestamp: Date.now(),
  skill: 'general',
  content: 'Hello! I am your **Re:Source Multi-Skill Agent**. I can analyze material photos, generate step-by-step repair guides, search leftover materials nearby, and architect custom reuse projects.',
  suggestedPrompts: [
    'How to fix a cracked terracotta pot?',
    'Find timber offcuts in Indiranagar',
    'I want to build a garden planter box',
    'Analyze photo of leftover ceramic tiles'
  ]
}

export function AgentChat({
  items,
  saved,
  onToggleSave,
  onSelectItem,
  onViewProject,
  requirements,
  onRequirementsChange,
  ready,
  onConfirmRequirements,
  onEditRequirements
}: AgentChatProps) {
  // State for conversations
  const [conversations, setConversations] = useState<ConversationSession[]>(() => {
    try {
      const stored = localStorage.getItem('resource-agent-conversations')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: 'initial-session',
        title: 'Project & Repair Chat',
        activeSkill: 'general',
        messages: [INITIAL_WELCOME_MESSAGE],
        requirements,
        ready: false,
        updatedAt: Date.now()
      }
    ]
  })

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('resource-agent-active-id')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return 'initial-session'
  })

  const currentSession = conversations.find(c => c.id === activeSessionId) || conversations[0]

  // Composer state
  const [inputText, setInputText] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedPhotoName, setSelectedPhotoName] = useState<string>('')
  const [activeSkillFilter, setActiveSkillFilter] = useState<AgentSkill>('general')
  const [isTyping, setIsTyping] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages, isTyping])

  // Save conversations to localStorage
  const persistSessions = (updated: ConversationSession[], newActiveId?: string) => {
    setConversations(updated)
    localStorage.setItem('resource-agent-conversations', JSON.stringify(updated))
    if (newActiveId) {
      setActiveSessionId(newActiveId)
      localStorage.setItem('resource-agent-active-id', JSON.stringify(newActiveId))
    }
  }

  // Create new conversation
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`
    const newSession: ConversationSession = {
      id: newId,
      title: 'New Material Chat',
      activeSkill: 'general',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          timestamp: Date.now(),
          skill: 'general',
          content: 'What are you working on? Ask to find materials, send a picture to diagnose condition, or ask how to fix or build something.',
          suggestedPrompts: [
            'How to fix a wobbly table with reclaimed timber?',
            'Find tiles for a mosaic project',
            'I want to build a bench from offcuts',
            'Analyze my leftover materials'
          ]
        }
      ],
      requirements,
      ready: false,
      updatedAt: Date.now()
    }
    persistSessions([newSession, ...conversations], newId)
    setActiveSkillFilter('general')
    setSelectedPhoto(null)
    setInputText('')
  }

  // Delete conversation
  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const remaining = conversations.filter(c => c.id !== sessionId)
    if (remaining.length === 0) {
      handleNewChat()
    } else {
      const nextActive = activeSessionId === sessionId ? remaining[0].id : activeSessionId
      persistSessions(remaining, nextActive)
    }
  }

  // Handle Photo File selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedPhoto(reader.result as string)
      setSelectedPhotoName(file.name)
      setActiveSkillFilter('analyze')
    }
    reader.readAsDataURL(file)
  }

  // Quick sample photo helper
  const handlePickSamplePhoto = (sampleUrl: string, sampleName: string, promptText: string) => {
    setSelectedPhoto(sampleUrl)
    setSelectedPhotoName(sampleName)
    setInputText(promptText)
    setActiveSkillFilter('analyze')
  }

  // Toggle step completion in Step-by-Step guides
  const toggleStepDone = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }))
  }

  // Send message handler
  const handleSendMessage = (overrideText?: string) => {
    const textToSend = (overrideText || inputText).trim()
    if (!textToSend && !selectedPhoto) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: Date.now(),
      content: textToSend || (selectedPhoto ? 'Please analyze this photo of my leftover materials.' : ''),
      skill: activeSkillFilter,
      photoUrl: selectedPhoto || undefined,
      photoName: selectedPhotoName || undefined
    }

    const updatedMessages = [...currentSession.messages, userMessage]

    // Update conversation title if default
    let sessionTitle = currentSession.title
    if (sessionTitle === 'New Material Chat' || sessionTitle === 'Project & Repair Chat') {
      sessionTitle = textToSend.length > 32 ? `${textToSend.slice(0, 32)}…` : textToSend || 'Photo Analysis'
    }

    // Set state immediately for responsiveness
    const sessionWithUserMsg: ConversationSession = {
      ...currentSession,
      title: sessionTitle,
      messages: updatedMessages,
      updatedAt: Date.now()
    }

    const currentSessionsList = conversations.map(c =>
      c.id === currentSession.id ? sessionWithUserMsg : c
    )
    persistSessions(currentSessionsList)

    setInputText('')
    const photoToProcess = selectedPhoto
    const photoNameToProcess = selectedPhotoName
    setSelectedPhoto(null)
    setSelectedPhotoName('')
    setIsTyping(true)

    // Simulate Agent Thinking & Processing
    setTimeout(() => {
      const { responseMessage, suggestedRequirements, activeSkill } = executeAgentSkill({
        prompt: textToSend,
        photoUrl: photoToProcess || undefined,
        photoName: photoNameToProcess || undefined,
        requestedSkill: activeSkillFilter !== 'general' ? activeSkillFilter : undefined,
        items,
        activeRequirements: requirements
      })

      // If agent suggested category update
      if (suggestedRequirements?.category && suggestedRequirements.category !== requirements.category) {
        onRequirementsChange({
          ...requirements,
          category: suggestedRequirements.category
        })
      }

      const completedSession: ConversationSession = {
        ...sessionWithUserMsg,
        activeSkill,
        messages: [...updatedMessages, responseMessage],
        updatedAt: Date.now()
      }

      const finalList = currentSessionsList.map(c =>
        c.id === currentSession.id ? completedSession : c
      )
      persistSessions(finalList)
      setIsTyping(false)
    }, 600)
  }

  return (
    <div className="agent-chat-container">
      {/* Sidebar: Conversation History */}
      <aside className="agent-sidebar">
        <div className="sidebar-header">
          <Button className="new-agent-chat-btn" onClick={handleNewChat}>
            <Plus size={16} /> New Chat
          </Button>
        </div>

        <div className="sidebar-section-title">
          <span>Active Agents & Chats</span>
        </div>

        <div className="agent-conversation-list">
          {conversations.map(session => {
            const isActive = session.id === currentSession.id
            const skillMeta = AVAILABLE_SKILLS.find(s => s.id === session.activeSkill)
            return (
              <div
                key={session.id}
                className={`agent-conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveSessionId(session.id)
                  localStorage.setItem('resource-agent-active-id', JSON.stringify(session.id))
                }}
              >
                <div className="conv-icon-col">
                  {session.activeSkill === 'analyze' ? (
                    <Camera size={15} style={{ color: '#a78bfa' }} />
                  ) : session.activeSkill === 'get_steps' ? (
                    <Wrench size={15} style={{ color: '#fbbf24' }} />
                  ) : session.activeSkill === 'build_plan' ? (
                    <Hammer size={15} style={{ color: '#60a5fa' }} />
                  ) : (
                    <MessageCircle size={15} style={{ color: '#34d399' }} />
                  )}
                </div>
                <div className="conv-title-col">
                  <div className="conv-title">{session.title}</div>
                  <div className="conv-skill-badge">{skillMeta ? skillMeta.name : 'Multi-Skill'}</div>
                </div>
                <button
                  className="conv-delete-btn"
                  onClick={e => handleDeleteChat(session.id, e)}
                  aria-label="Delete chat"
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>

        <div className="sidebar-footer-stats">
          <div className="saved-counter-pill" onClick={onViewProject}>
            <Bookmark size={13} />
            <span>My Project: <strong>{saved.length}</strong> saved</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <section className="agent-chat-main">
        {/* Agent Skill Switcher Header */}
        <div className="agent-top-bar">
          <div className="agent-identity">
            <div className="agent-avatar-glow">
              <Sparkles size={18} />
            </div>
            <div className="agent-text-meta">
              <div className="agent-title-row">
                <strong>Re:Source Autonomous Assistant</strong>
                <span className="live-status-pill">
                  <span className="live-dot" /> SKILLS READY
                </span>
              </div>
              <small className="agent-subtitle">
                Autonomous agent with Vision, Step-by-Step DIY Guides, Inventory Search, and Project Architecture
              </small>
            </div>
          </div>

          {/* Quick Skill Selector Bar */}
          <div className="skill-pills-bar">
            {AVAILABLE_SKILLS.map(skill => {
              const isSelected = activeSkillFilter === skill.id
              return (
                <button
                  key={skill.id}
                  className={`skill-pill-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveSkillFilter(isSelected ? 'general' : skill.id)}
                  title={skill.description}
                >
                  {skill.id === 'analyze' && <Camera size={13} />}
                  {skill.id === 'get_steps' && <Wrench size={13} />}
                  {skill.id === 'search' && <Search size={13} />}
                  {skill.id === 'build_plan' && <Hammer size={13} />}
                  <span>{skill.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Thread Messages */}
        <div className="agent-chat-thread">
          {currentSession.messages.map(msg => (
            <div key={msg.id} className={`agent-message-row ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="assistant-avatar-pill">
                  {msg.skill === 'analyze' ? (
                    <Camera size={15} />
                  ) : msg.skill === 'get_steps' ? (
                    <Wrench size={15} />
                  ) : msg.skill === 'build_plan' ? (
                    <Hammer size={15} />
                  ) : (
                    <Sparkles size={15} />
                  )}
                </div>
              )}

              <div className="agent-message-body">
                {/* Skill Attribution Pill */}
                {msg.role === 'assistant' && msg.skill !== 'general' && (
                  <div className={`active-skill-tag ${msg.skill}`}>
                    {msg.skill === 'analyze' && '✨ Skill: Material Vision & Photo Diagnostic'}
                    {msg.skill === 'get_steps' && '🛠️ Skill: Repair & DIY Step Guide'}
                    {msg.skill === 'search' && '🔍 Skill: Marketplace Inventory Finder'}
                    {msg.skill === 'build_plan' && '📐 Skill: Project Architect Blueprint'}
                  </div>
                )}

                {/* User Photo Thumbnail (if attached) */}
                {msg.photoUrl && (
                  <div className="message-photo-preview">
                    <img src={msg.photoUrl} alt="User attached material" />
                    {msg.photoName && <span className="photo-caption">{msg.photoName}</span>}
                  </div>
                )}

                {/* Text Bubble */}
                {msg.content && (
                  <div className="message-text-bubble">
                    <p>{msg.content}</p>
                  </div>
                )}

                {/* 1. PHOTO ANALYSIS CARD */}
                {msg.analysis && (
                  <div className="skill-card analysis-card">
                    <div className="card-header">
                      <div className="header-left">
                        <Camera size={18} className="header-icon" />
                        <div>
                          <h4>{msg.analysis.detectedMaterial}</h4>
                          <span className="category-tag">{msg.analysis.materialCategory}</span>
                        </div>
                      </div>
                      <div className={`condition-badge ${msg.analysis.conditionStatus}`}>
                        {msg.analysis.conditionRating}
                      </div>
                    </div>

                    {msg.analysis.estimatedDimensions && (
                      <div className="card-dim-row">
                        <SlidersHorizontal size={14} />
                        <span>Estimated dimensions: <strong>{msg.analysis.estimatedDimensions}</strong></span>
                      </div>
                    )}

                    <div className="inspection-section">
                      <h5>Visual Diagnostic Findings:</h5>
                      <ul>
                        {msg.analysis.inspectionNotes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="prep-section">
                      <h5>Recommended Prep & Conditioning:</h5>
                      <ol>
                        {msg.analysis.recommendedPrep.map((prep, i) => (
                          <li key={i}>{prep}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="card-action-bar">
                      <button
                        className="sub-action-btn"
                        onClick={() =>
                          handleSendMessage(`How to fix and use these ${msg.analysis?.materialCategory.toLowerCase()}?`)
                        }
                      >
                        <Wrench size={14} /> Get Step-by-Step Fix Guide
                      </button>
                      <button
                        className="sub-action-btn"
                        onClick={() =>
                          handleSendMessage(`Find more ${msg.analysis?.materialCategory.toLowerCase()} in Bengaluru`)
                        }
                      >
                        <Search size={14} /> Find Matching Leftovers
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. STEP-BY-STEP REPAIR & DIY GUIDE CARD */}
                {msg.stepsGuide && (
                  <div className="skill-card steps-card">
                    <div className="card-header">
                      <div className="header-left">
                        <Wrench size={18} className="header-icon" />
                        <div>
                          <h4>{msg.stepsGuide.title}</h4>
                          <p className="card-sub">{msg.stepsGuide.subtitle}</p>
                        </div>
                      </div>
                      <div className="meta-pills">
                        <span className="time-pill">
                          <Clock size={13} /> {msg.stepsGuide.estimatedTime}
                        </span>
                        <span className={`diff-pill ${msg.stepsGuide.difficulty.toLowerCase()}`}>
                          {msg.stepsGuide.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Materials Needed */}
                    <div className="materials-needed-box">
                      <h5>Materials Required for this Project:</h5>
                      <div className="material-tags-grid">
                        {msg.stepsGuide.materialsNeeded.map((mat, i) => (
                          <div key={i} className="mat-needed-item">
                            <div className="mat-info">
                              <strong>{mat.name}</strong>
                              <span className="mat-note">{mat.note}</span>
                            </div>
                            <button
                              className="search-mat-btn"
                              title="Search this leftover material"
                              onClick={() =>
                                handleSendMessage(
                                  `Find leftover ${mat.searchKeyword || mat.category} nearby`
                                )
                              }
                            >
                              <Search size={12} /> Find
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tools Needed */}
                    {msg.stepsGuide.toolsNeeded.length > 0 && (
                      <div className="tools-needed-row">
                        <span className="tools-label">Tools:</span>
                        <div className="tool-chips">
                          {msg.stepsGuide.toolsNeeded.map((t, i) => (
                            <span key={i} className="tool-chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safety Tips */}
                    {msg.stepsGuide.safetyTips.length > 0 && (
                      <div className="safety-alert-box">
                        <ShieldAlert size={15} />
                        <div>
                          <strong>Safety precautions:</strong>
                          <span> {msg.stepsGuide.safetyTips.join(' · ')}</span>
                        </div>
                      </div>
                    )}

                    {/* Steps List with interactive checkboxes */}
                    <div className="interactive-steps-list">
                      <h5>Guided Steps:</h5>
                      {msg.stepsGuide.steps.map(s => {
                        const stepKey = `${msg.id}-step-${s.stepNumber}`
                        const isDone = !!completedSteps[stepKey]
                        return (
                          <div
                            key={s.stepNumber}
                            className={`guide-step-item ${isDone ? 'done' : ''}`}
                            onClick={() => toggleStepDone(stepKey)}
                          >
                            <button
                              type="button"
                              className={`step-checkbox ${isDone ? 'checked' : ''}`}
                              aria-label={`Mark step ${s.stepNumber} done`}
                            >
                              {isDone ? <Check size={13} /> : s.stepNumber}
                            </button>
                            <div className="step-content">
                              <h6>{s.title}</h6>
                              <p>{s.instruction}</p>
                              {s.tip && <small className="pro-tip">💡 Pro Tip: {s.tip}</small>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 3. BUILD PLAN BLUEPRINT CARD */}
                {msg.buildPlan && (
                  <div className="skill-card plan-card">
                    <div className="card-header">
                      <div className="header-left">
                        <Hammer size={18} className="header-icon" />
                        <div>
                          <h4>{msg.buildPlan.projectName}</h4>
                          <p className="card-sub">{msg.buildPlan.overview}</p>
                        </div>
                      </div>
                    </div>

                    {msg.buildPlan.estimatedDimensions && (
                      <div className="card-dim-row">
                        <SlidersHorizontal size={14} />
                        <span>Planned Dimensions: <strong>{msg.buildPlan.estimatedDimensions}</strong></span>
                      </div>
                    )}

                    <div className="phases-container">
                      {msg.buildPlan.phases.map((phase, pIdx) => (
                        <div key={pIdx} className="phase-block">
                          <h6>{phase.phaseName}</h6>
                          <ol>
                            {phase.steps.map((st, sIdx) => (
                              <li key={sIdx}>{st}</li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>

                    <div className="plan-materials-table">
                      <h5>Required Leftover Material Bill:</h5>
                      <div className="plan-mat-list">
                        {msg.buildPlan.requiredMaterials.map((rm, i) => (
                          <div key={i} className="plan-mat-row">
                            <div className="plan-mat-col">
                              <strong>{rm.name}</strong>
                              <small>{rm.reason}</small>
                            </div>
                            <div className="plan-mat-action">
                              <span className="qty-badge">{rm.requiredQty}</span>
                              <button
                                className="search-mat-btn"
                                onClick={() => handleSendMessage(`Find ${rm.category} for my build`)}
                              >
                                <Search size={12} /> Find
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. EMBEDDED REQUIREMENTS PANEL (when relevant) */}
                {msg.showRequirements && (
                  <div className="chat-requirements-card">
                    <RequirementsPanel
                      value={requirements}
                      onChange={onRequirementsChange}
                      ready={ready}
                      onConfirm={onConfirmRequirements}
                      onEdit={onEditRequirements}
                    />
                  </div>
                )}

                {/* 5. MATCHED INVENTORY LISTINGS CAROUSEL / GRID */}
                {msg.matchedListings && msg.matchedListings.length > 0 && (
                  <div className="matched-materials-container">
                    <div className="matched-title-row">
                      <Search size={14} />
                      <span>Available Marketplace Leftovers ({msg.matchedListings.length} matches):</span>
                    </div>

                    <div className="matched-listings-grid">
                      {msg.matchedListings.map(listing => {
                        const isSaved = saved.includes(listing.id)
                        const area = listingArea(listing)
                        return (
                          <div key={listing.id} className="matched-item-card">
                            <div className="item-card-top">
                              <span className="item-category-badge">{listing.category}</span>
                              <span className="item-price">
                                {listing.price === 0 ? 'Free' : `₹${listing.price}`}
                              </span>
                            </div>

                            <h5 className="item-title" onClick={() => onSelectItem(listing)}>
                              {listing.title}
                            </h5>

                            <div className="item-specs">
                              <span>{listing.qty} {listing.unit}</span>
                              <span>·</span>
                              <span>{listing.locality}</span>
                              {area && <span>· {areaText(area)}</span>}
                            </div>

                            <p className="item-detail-snip">{listing.detail}</p>

                            <div className="item-actions">
                              <button
                                className="item-view-btn"
                                onClick={() => onSelectItem(listing)}
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                className={`item-save-btn ${isSaved ? 'saved' : ''}`}
                                onClick={() => onToggleSave(listing.id)}
                              >
                                {isSaved ? (
                                  <>
                                    <Check size={13} /> Saved
                                  </>
                                ) : (
                                  <>
                                    <Bookmark size={13} /> Save to Project
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* SUGGESTED FOLLOW-UP PROMPTS */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="suggested-prompts-row">
                    {msg.suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        className="prompt-chip"
                        onClick={() => handleSendMessage(prompt)}
                      >
                        <ChevronRight size={13} /> {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="agent-message-row assistant">
              <div className="assistant-avatar-pill">
                <Sparkles size={15} />
              </div>
              <div className="typing-indicator-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-text">Agent is processing skills & inventory…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Photo Preview Bar in Composer */}
        {selectedPhoto && (
          <div className="composer-photo-preview-bar">
            <div className="preview-img-wrap">
              <img src={selectedPhoto} alt="Selected preview" />
            </div>
            <div className="preview-meta">
              <strong>{selectedPhotoName || 'Photo attached'}</strong>
              <small>Vision agent will analyze condition & suggest repairs</small>
            </div>
            <button
              className="remove-photo-btn"
              onClick={() => {
                setSelectedPhoto(null)
                setSelectedPhotoName('')
              }}
              title="Remove photo"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Quick Sample Photos Bar when no photo is attached */}
        {!selectedPhoto && (
          <div className="quick-samples-bar">
            <span className="samples-label">
              <ImageIcon size={13} /> Try Sample Photo:
            </span>
            <button
              className="sample-photo-btn"
              onClick={() =>
                handlePickSamplePhoto(
                  SAMPLE_PHOTO_TILE,
                  'mosaic_ceramic_tiles.jpg',
                  'Analyze these leftover mosaic tiles and tell me how to use them'
                )
              }
            >
              🧩 Ceramic Tiles
            </button>
            <button
              className="sample-photo-btn"
              onClick={() =>
                handlePickSamplePhoto(
                  SAMPLE_PHOTO_POT,
                  'cracked_terracotta_pot.jpg',
                  'How to fix this cracked terracotta pot and what materials do I need?'
                )
              }
            >
              🏺 Cracked Pot
            </button>
            <button
              className="sample-photo-btn"
              onClick={() =>
                handlePickSamplePhoto(
                  SAMPLE_PHOTO_WOOD,
                  'pine_timber_offcuts.jpg',
                  'I want to build a bench from these timber offcuts'
                )
              }
            >
              🪵 Timber Offcuts
            </button>
          </div>
        )}

        {/* Composer Form */}
        <form
          className="agent-composer"
          onSubmit={e => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
          />

          <button
            type="button"
            className={`attach-photo-btn ${selectedPhoto ? 'has-photo' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach a photo of leftover or damaged material"
            aria-label="Upload photo"
          >
            <Camera size={19} />
          </button>

          <textarea
            className="composer-textarea"
            rows={1}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={
              selectedPhoto
                ? 'Ask how to fix, what it is, or what materials are required…'
                : activeSkillFilter === 'analyze'
                ? 'Send a picture or describe material to analyze condition…'
                : activeSkillFilter === 'get_steps'
                ? 'Ask "How to fix a wobbly table" or get DIY repair steps…'
                : activeSkillFilter === 'build_plan'
                ? 'Tell me what you want to build (e.g. "I want to build a planter")…'
                : 'Ask to find materials, send picture to fix, or "I want to build something"…'
            }
          />

          <Button
            type="submit"
            className="agent-send-btn"
            disabled={(!inputText.trim() && !selectedPhoto) || isTyping}
            aria-label="Send prompt to agent"
          >
            <Send size={17} />
          </Button>
        </form>

        <div className="agent-footer-info">
          <span>Vision Analysis</span>
          <span>·</span>
          <span>Repair & How-to Steps</span>
          <span>·</span>
          <span>Material Matching</span>
          <span>·</span>
          <span>Project Architecture</span>
        </div>
      </section>
    </div>
  )
}
