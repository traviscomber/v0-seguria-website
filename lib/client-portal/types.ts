import type { Device, Document } from '@/lib/types'

export type PortalTone = 'ok' | 'warning' | 'critical'
export type PortalSiteStatus = 'operativo' | 'atencion' | 'revision'
export type PortalIncidentStatus =
  | 'new'
  | 'validating'
  | 'confirmed'
  | 'responding'
  | 'resolved'
  | 'false_alarm'

export interface PortalSiteSummary {
  organizationId: string
  organizationName: string
  propertyId: string
  projectId: string
  label: string
  location: string
  imageUrl: string
  imageAlt: string
  imageCredit: string
  imageCreditUrl: string
  imageIsRepresentative: boolean
  status: PortalSiteStatus
  statusLabel: string
  deviceCount: number
  cameraCount: number
  sensorCount: number
  accessCount: number
  documentCount: number
  alertCount: number
  lastUpdatedAt?: Date
  devices: Device[]
  documents: Document[]
  events: PortalEvent[]
  spaces: PortalSpace[]
  incidents: PortalIncident[]
  gatewayHealth: PortalGatewayHealth
  report: PortalOperationalReport
  profile: PortalSiteProfile
}

export interface PortalSiteProfile {
  key: 'dairy_field' | 'hotel' | 'general'
  eyebrow: string
  headline: string
  summary: string
  operatingPromise: string
  integrationPromise: string
  focusAreas: string[]
  commandCenter: Array<{ label: string; value: string; detail: string }>
  assurance: Array<{ label: string; value: string; detail: string }>
  shiftFlow: Array<{ label: string; moment: string; detail: string }>
  escalationMatrix: Array<{
    label: string
    trigger: string
    owner: string
    response: string
  }>
  evidencePackage: Array<{ label: string; detail: string }>
  responsePlan: string[]
  metricLabels: {
    camera: string
    sensor: string
    alert: string
    access: string
  }
  recommendedStableAction: string
  recommendedAttentionAction: string
}

export interface PortalSpace {
  id: string
  name: string
  cameraCount: number
  sensorCount: number
  alertCount: number
  lastUpdatedAt?: Date
}

export interface PortalEvent {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  state?: string
  title: string
  occurredAt: Date
}

export interface PortalIncidentEvidence {
  id: string
  title: string
  capturedAt: Date
  deviceId?: string
  fileName: string
  association: 'primary' | 'correlated' | 'operator_pinned' | 'time_window'
  note?: string
  pinned: boolean
}

export interface PortalDeviceBucket {
  key: 'camera' | 'sensor' | 'alert' | 'access' | 'other'
  label: string
  count: number
  devices: Device[]
}

export interface PortalIncident {
  id: string
  propertyId: string
  title: string
  description?: string
  severity: 'warning' | 'critical'
  status: PortalIncidentStatus
  statusLabel: string
  acknowledgedAt?: Date
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
  relatedEvents: PortalEvent[]
  evidence: PortalIncidentEvidence[]
}

export interface PortalGatewayHealth {
  total: number
  online: number
  degraded: number
  offline: number
  lastSeenAt?: Date
}

export interface PortalSensorRisk {
  stable: number
  attention: number
  critical: number
}

export interface PortalOperationalReport {
  eventsToday: number
  criticalEventsToday: number
  incidentsThisMonth: number
  resolvedThisMonth: number
  overdueConfirmations: number
  averageConfirmationMinutes?: number
  averageResolutionHours?: number
}

export interface PortalOperationalScore {
  score: number
  label: string
  tone: PortalTone
  summary: string
  drivers: string[]
}

export interface PortalDailyPriority {
  id: string
  siteLabel: string
  title: string
  detail: string
  action: string
  tone: PortalTone
  rank: number
}

export interface PortalCoverageZone {
  id: string
  siteLabel: string
  name: string
  cameraCount: number
  sensorCount: number
  alertCount: number
  score: number
  statusLabel: string
  summary: string
  action: string
  tone: PortalTone
  updatedAt?: Date
}

export interface PortalServiceCommitment {
  id: string
  siteLabel: string
  label: string
  target: string
  current: string
  summary: string
  action: string
  tone: PortalTone
  rank: number
}

export interface PortalExecutiveBrief {
  title: string
  periodLabel: string
  verdict: string
  narrative: string
  highlights: string[]
  focus: string[]
  tone: PortalTone
}

export interface PortalSensitiveWindow {
  id: string
  siteLabel: string
  label: string
  range: string
  eventCount: number
  incidentCount: number
  criticalCount: number
  summary: string
  action: string
  tone: PortalTone
  rank: number
}

export interface PortalImprovementAction {
  id: string
  siteLabel: string
  title: string
  why: string
  nextStep: string
  expectedImpact: string
  tone: PortalTone
  rank: number
}

export interface PortalDecisionPacket {
  id: string
  siteLabel: string
  decision: string
  owner: string
  evidence: string
  timing: string
  outcome: string
  tone: PortalTone
  rank: number
}

export interface PortalOperationalFlowStep {
  id: string
  siteLabel: string
  stage: string
  title: string
  metric: string
  reading: string
  action: string
  proof: string
  tone: PortalTone
  rank: number
}

export interface PortalBoardReport {
  title: string
  periodLabel: string
  verdict: string
  outcome: string
  risk: string
  decision: string
  proofPoints: string[]
  metrics: Array<{
    label: string
    value: string
    detail: string
    tone: PortalTone
  }>
  tone: PortalTone
}

export interface PortalGovernanceRitual {
  id: string
  siteLabel: string
  cadence: string
  title: string
  owner: string
  question: string
  input: string
  output: string
  tone: PortalTone
  rank: number
}

export interface PortalActionRegisterItem {
  id: string
  siteLabel: string
  title: string
  owner: string
  due: string
  status: string
  why: string
  nextStep: string
  successCriteria: string
  tone: PortalTone
  rank: number
}

export interface PortalTraceabilityItem {
  id: string
  siteLabel: string
  title: string
  source: string
  evidence: string
  decisionLink: string
  status: string
  occurredAt: Date
  tone: PortalTone
  rank: number
}

export interface PortalRiskMapItem {
  id: string
  siteLabel: string
  zone: string
  window: string
  exposure: string
  protection: string
  action: string
  owner: string
  tone: PortalTone
  rank: number
}

export interface PortalMaturityScorecardItem {
  id: string
  label: string
  score: number
  level: string
  reading: string
  nextStep: string
  tone: PortalTone
  rank: number
}

export interface PortalWeeklyDecisionAgendaItem {
  id: string
  siteLabel: string
  decision: string
  priorityLabel: string
  evidence: string
  owner: string
  deadline: string
  expectedOutcome: string
  customerValue: string
  tone: PortalTone
  rank: number
}

export interface PortalLeadershipBrief {
  title: string
  headline: string
  businessReading: string
  customerOutcome: string
  nextConversation: string
  tone: PortalTone
  pillars: Array<{
    label: string
    value: string
    detail: string
    proof: string
    tone: PortalTone
  }>
}

export interface PortalTrustCenterItem {
  id: string
  label: string
  value: string
  promise: string
  proof: string
  customerMeaning: string
  tone: PortalTone
  rank: number
}

export interface PortalShiftHandoffItem {
  id: string
  siteLabel: string
  moment: string
  title: string
  summary: string
  checklist: string[]
  riskWindow: string
  owner: string
  output: string
  tone: PortalTone
  rank: number
}

export interface PortalOperationalForecast {
  title: string
  horizon: string
  direction: string
  summary: string
  primaryRisk: string
  bestMove: string
  tone: PortalTone
  signals: Array<{
    label: string
    value: string
    reading: string
    action: string
    tone: PortalTone
  }>
}

export interface PortalMeetingPack {
  title: string
  subtitle: string
  opening: string
  decision: string
  evidence: string
  commitment: string
  close: string
  tone: PortalTone
  agenda: Array<{
    label: string
    detail: string
    owner: string
    outcome: string
    tone: PortalTone
  }>
}

export interface PortalResponsePlaybookItem {
  id: string
  siteLabel: string
  level: string
  trigger: string
  firstMove: string
  verify: string
  escalate: string
  close: string
  owner: string
  tone: PortalTone
  rank: number
}

export interface PortalSiteHealthRankingItem {
  id: string
  propertyId: string
  siteLabel: string
  organizationName: string
  position: number
  score: number
  status: string
  summary: string
  strongestPoint: string
  attentionPoint: string
  nextMove: string
  tone: PortalTone
  rank: number
}

export interface PortalDecisionRoom {
  title: string
  headline: string
  brief: string
  decisionNow: string
  reason: string
  evidence: string
  owner: string
  deadline: string
  siteLabel: string
  status: string
  tone: PortalTone
  lanes: Array<{
    label: string
    value: string
    detail: string
    tone: PortalTone
  }>
  sequence: Array<{ label: string; detail: string }>
}

export interface PortalLiveOperation {
  title: string
  headline: string
  summary: string
  nowLabel: string
  nowDetail: string
  evidenceLabel: string
  evidenceDetail: string
  owner: string
  close: string
  tone: PortalTone
  lanes: Array<{
    label: string
    value: string
    detail: string
    tone: PortalTone
  }>
  timeline: Array<{
    label: string
    title: string
    detail: string
    at?: Date
    tone: PortalTone
  }>
}

export interface PortalEvidenceGalleryItem {
  id: string
  label: string
  title: string
  detail: string
  proof: string
  status: string
  action: string
  at?: Date
  tone: PortalTone
  rank: number
}

export interface PortalNotificationMetric {
  propertyId: string
  severity: 'warning' | 'critical'
  status: string
  dueAt: Date
  createdAt: Date
  acknowledgedAt?: Date
  escalatedAt?: Date
}

export interface PortalSnapshot {
  id: string
  propertyId: string
  deviceId?: string
  objectPath: string
  mimeType: string
  capturedAt: Date
  createdAt: Date
}
