'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AgentStatus {
  type: string
  status: 'active' | 'idle' | 'error' | 'offline'
  responseTime: number
  lastSeen: string
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'agent_metrics':
          updateAgentMetrics(message.data)
          break
        case 'alert':
          handleNewAlert(message.data)
          break
        case 'initial_data':
          setAgents(message.data.agentMetrics || [])
          setAlerts(message.data.alerts || [])
          break
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)
    }

    // Fetch initial data
    fetchInitialData()

    return () => {
      ws.close()
    }
  }, [])

  const fetchInitialData = async () => {
    try {
      const [agentsRes, healthRes, alertsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/agents/status'),
        fetch('http://localhost:3000/api/v1/system/health'),
        fetch('http://localhost:3000/api/v1/alerts/active')
      ])

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        setAgents(agentsData)
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth(healthData)
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData)
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const updateAgentMetrics = (metrics: any) => {
    setAgents((prev) => {
      const existing = prev.find((a) => a.type === metrics.agentType)
      if (existing) {
        return prev.map((a) =>
          a.type === metrics.agentType
            ? { ...a, status: metrics.status, responseTime: metrics.metrics.responseTime, lastSeen: metrics.timestamp }
            : a
        )
      }
      return [
        ...prev,
        {
          type: metrics.agentType,
          status: metrics.status,
          responseTime: metrics.metrics.responseTime,
          lastSeen: metrics.timestamp,
        },
      ]
    })
  }

  const handleNewAlert = (alert: any) => {
    setAlerts((prev) => [alert, ...prev].slice(0, 10))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'processing':
        return <Activity className="w-4 h-4 text-green-500" />
      case 'idle':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800'
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Frontend Design Monitoring
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm font-medium">{wsConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Health Summary */}
        {systemHealth && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {systemHealth.status}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Agents</span>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {systemHealth.agents?.filter((a: any) => a.status === 'active' || a.status === 'processing').length || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">DB Response</span>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {systemHealth.components?.database?.responseTime || 0}ms
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => !a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Agent Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(agent.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {formatAgentName(agent.type)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {agent.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.responseTime}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Alerts
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No active alerts
              </div>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function formatAgentName(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
