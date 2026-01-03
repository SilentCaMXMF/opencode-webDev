'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AgentType } from '@types/monitoring'

export default function AgentDetailsPage({ params }: { params: { agent: string } }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [agentInfo, setAgentInfo] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    fetchAgentMetrics()
  }, [params.agent, timeRange])

  const fetchAgentMetrics = async () => {
    try {
      const [metricsRes, infoRes] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/metrics?agentType=${params.agent}&metricType=agent_response_time`),
        fetch(`http://localhost:3000/api/v1/agents/status`)
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(processMetricsData(metricsData))
      }

      if (infoRes.ok) {
        const infoData = await infoRes.json()
        const agent = infoData.find((a: any) => a.type === params.agent)
        setAgentInfo(agent)
      }
    } catch (error) {
      console.error('Failed to fetch agent metrics:', error)
    }
  }

  const processMetricsData = (rawData: any[]): any[] => {
    return rawData
      .map((item) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        responseTime: item.response_time,
        errorRate: item.error_rate,
        completionRate: item.task_completion_rate,
      }))
      .reverse()
      .slice(0, 50)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Details: {formatAgentName(params.agent)}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {agentInfo && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {agentInfo.status}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(agentInfo.responseTime)}ms
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Seen</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatTimeAgo(agentInfo.lastSeen)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Range</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Response Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Time Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="timestamp" className="text-gray-500 dark:text-gray-400" />
              <YAxis className="text-gray-500 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(31, 41, 55)',
                  border: 'none',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'white' }}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rate and Completion Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Error Rate
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="timestamp" className="text-gray-500 dark:text-gray-400" />
                <YAxis className="text-gray-500 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'white' }}
                />
                <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Completion Rate
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="timestamp" className="text-gray-500 dark:text-gray-400" />
                <YAxis className="text-gray-500 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'white' }}
                />
                <Line type="monotone" dataKey="completionRate" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
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

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}
