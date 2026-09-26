import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  MarkerType,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { api } from '../api/client.js'
import { useDevUser } from '../auth/DevUserContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import WorkflowNode from '../workflow/WorkflowNode.jsx'
import { workflowNodeType, workflowStatus } from '../constants.js'

const nodeTypes = { workflowNode: WorkflowNode }
const commonRoles = ['UnitHead', 'TeamLead', 'Officer', 'DeptAdmin']
import WorkflowFieldBuilder from '../components/WorkflowFieldBuilder.jsx'

function read(obj, camel, pascal) {
  return obj?.[camel] ?? obj?.[pascal]
}

function parseConfig(value) {
  if (!value) return {}
  try { return typeof value === 'string' ? JSON.parse(value) : value }
  catch { return {} }
}

function defaultNodes() {
  return [
    { id: 'start', type: 'workflowNode', position: { x: 80, y: 180 }, data: { label: 'Start', nodeType: 0 } },
    { id: 'end', type: 'workflowNode', position: { x: 620, y: 180 }, data: { label: 'Resolved', nodeType: 2 } },
  ]
}

export default function WorkflowDesignerPage({ workflowId, isNew, navigate }) {
  const { roles } = useDevUser()
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState('')
  const [selectedEdgeId, setSelectedEdgeId] = useState('')
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('New Complaint Workflow')
  const [departmentId, setDepartmentId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [definition, setDefinition] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  const selectedNode = useMemo(() => nodes.find((x) => x.id === selectedNodeId), [nodes, selectedNodeId])
  const selectedEdge = useMemo(() => edges.find((x) => x.id === selectedEdgeId), [edges, selectedEdgeId])
  const readOnly = definition && definition.status !== 0

  useEffect(() => {
    api('/reference/departments').then((items) => {
      setDepartments(items)
      if (isNew && items.length) setDepartmentId(items[0].id)
    }).catch((err) => setError(err.message))
  }, [isNew])

  useEffect(() => {
    if (!departmentId) return
    api(`/reference/categories?departmentId=${departmentId}`).then((items) => {
      setCategories(items)
      if (isNew && !items.some((x) => x.id === categoryId)) setCategoryId(items[0]?.id || '')
    }).catch((err) => setError(err.message))
  }, [departmentId])

  useEffect(() => {
    if (isNew || !workflowId) return
    setLoading(true)
    api(`/workflow-definitions/${workflowId}`)
      .then((item) => {
        setDefinition(item)
        setName(item.name)
        setDepartmentId(item.departmentId)
        setCategoryId(item.categoryId)
        const designer = JSON.parse(item.designerJson || '{}')
        const sourceNodes = read(designer, 'nodes', 'Nodes') || []
        const sourceEdges = read(designer, 'edges', 'Edges') || []
        const mappedNodes = sourceNodes.map((n) => {
          const config = parseConfig(read(n, 'configJson', 'ConfigJson'))
          return {
            id: read(n, 'key', 'Key'),
            type: 'workflowNode',
            position: { x: Number(read(n, 'x', 'X') || 0), y: Number(read(n, 'y', 'Y') || 0) },
            data: {
              label: read(n, 'name', 'Name'),
              nodeType: Number(read(n, 'type', 'Type')),
              roleCode: read(n, 'roleCode', 'RoleCode') || '',
              slaHours: read(n, 'slaHours', 'SlaHours') ?? '',
              escalationRoleCode: read(n, 'escalationRoleCode', 'EscalationRoleCode') || '',
              assignmentMode: config.assignmentMode || 'queue',
              sendEmailNotification: config.sendEmailNotification ?? false,
              fields: read(n, 'fields', 'Fields') || [],
            },
          }
        })
        const mappedEdges = sourceEdges.map((e, index) => {
          const source = read(e, 'sourceKey', 'SourceKey')
          const target = read(e, 'targetKey', 'TargetKey')
          const label = read(e, 'label', 'Label') || ''
          return {
            id: `edge-${index}-${source}-${target}`,
            source,
            target,
            label,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { outcomeKey: read(e, 'outcomeKey', 'OutcomeKey') || '', label },
          }
        })
        setNodes(mappedNodes)
        setEdges(mappedEdges)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [workflowId, isNew, setNodes, setEdges])

  const onConnect = useCallback((params) => {
    if (readOnly) return
    setEdges((current) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, data: { outcomeKey: '', label: '' } }, current))
  }, [readOnly, setEdges])

  const addHumanNode = () => {
    const id = `step-${crypto.randomUUID().slice(0, 8)}`
    setNodes((current) => [...current, {
      id,
      type: 'workflowNode',
      position: { x: 320 + current.length * 25, y: 140 + current.length * 18 },
      data: {
        label: 'New approval step',
        nodeType: 1,
        roleCode: 'TeamLead',
        slaHours: 24,
        escalationRoleCode: 'UnitHead',
        assignmentMode: 'queue',
        sendEmailNotification: false,
        fields: [],
      },
    }])
    setSelectedNodeId(id)
    setSelectedEdgeId('')
  }

  const addEndNode = () => {
    const id = `end-${crypto.randomUUID().slice(0, 8)}`
    setNodes((current) => [...current, { id, type: 'workflowNode', position: { x: 700, y: 320 }, data: { label: 'Completed', nodeType: 2 } }])
    setSelectedNodeId(id)
    setSelectedEdgeId('')
  }

  const updateSelectedNode = (patch) => {
    setNodes((current) => current.map((node) => node.id === selectedNodeId ? { ...node, data: { ...node.data, ...patch } } : node))
  }

  const updateSelectedEdge = (patch) => {
    setEdges((current) => current.map((edge) => edge.id === selectedEdgeId
      ? { ...edge, label: patch.label ?? edge.label, data: { ...edge.data, ...patch } }
      : edge))
  }

  const deleteSelection = () => {
    if (selectedNodeId) {
      setNodes((current) => current.filter((x) => x.id !== selectedNodeId))
      setEdges((current) => current.filter((x) => x.source !== selectedNodeId && x.target !== selectedNodeId))
      setSelectedNodeId('')
    } else if (selectedEdgeId) {
      setEdges((current) => current.filter((x) => x.id !== selectedEdgeId))
      setSelectedEdgeId('')
    }
  }

  const toPayload = () => ({
    name: name.trim(),

    departmentId: departmentId,
    categoryId: categoryId,

    nodes: nodes.map((node) => ({
      key: node.id,
      name: node.data.label,
      type: Number(node.data.nodeType),

      roleCode:
        Number(node.data.nodeType) === 1
          ? node.data.roleCode || null
          : null,

      slaHours:
        Number(node.data.nodeType) === 1
          ? Number(node.data.slaHours) || null
          : null,

      escalationRoleCode:
        Number(node.data.nodeType) === 1
          ? node.data.escalationRoleCode || null
          : null,

      x: node.position.x,
      y: node.position.y,

      configJson:
        Number(node.data.nodeType) === 1
          ? JSON.stringify({
              assignmentMode:
                node.data.assignmentMode || 'queue',

              sendEmailNotification:
                !!node.data.sendEmailNotification,
            })
          : null,

      fields:
        Number(node.data.nodeType) === 1
          ? (node.data.fields || []).map((field, index) => ({
              fieldKey: field.fieldKey,
              label: field.label,
              fieldType: field.fieldType,
              placeholder: field.placeholder || null,
              isRequired: !!field.isRequired,
              displayOrder: index,
              options: field.options || [],

              // ---- ATTACHMENT CONFIG ----
              allowedFileTypes:
                field.fieldType === 'attachment'
                  ? field.allowedFileTypes || null
                  : null,

              maxFileSizeMb:
                field.fieldType === 'attachment'
                  ? field.maxFileSizeMb != null
                    ? Number(field.maxFileSizeMb)
                    : null
                  : null,

              allowMultiple:
                field.fieldType === 'attachment'
                  ? !!field.allowMultiple
                  : null,
            }))
          : [],
    })),

    edges: edges.map((edge) => ({
      sourceKey: edge.source,
      targetKey: edge.target,
      outcomeKey: edge.data?.outcomeKey || null,
      label: edge.data?.label || edge.label || null,
    })),
  })

  const save = async () => {
    if (readOnly) return definition
    setSaving(true)
    setError('')
    try {
      const payload = toPayload()
      const saved = isNew
        ? await api('/workflow-definitions', { method: 'POST', body: payload })
        : await api(`/workflow-definitions/${workflowId}`, { method: 'PUT', body: payload })
      setDefinition(saved)
      if (isNew) navigate(`/workflows/${saved.id}/designer`)
      return saved
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    const saved = await save()
    if (!saved) return
    setSaving(true)
    try {
      const published = await api(`/workflow-definitions/${saved.id}/publish`, { method: 'POST' })
      setDefinition(published)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  if (!roles.has('DeptAdmin') && !roles.has('UnitHead'))
    return (
      <section className="panel">
        <ErrorBanner message="Unit Head or Department Admin access is required for the workflow designer." />
      </section>
    )

  return (
    <>
      <PageHeader
        eyebrow="VISUAL WORKFLOW DESIGNER"
        title={isNew ? 'Create workflow' : name}
        description={definition ? `Version ${definition.version} · ${workflowStatus[definition.status]}` : 'Build the process by connecting role-based steps.'}
        actions={
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/workflows')}>← Library</button>
            {!readOnly && <button className="btn btn-secondary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save draft'}</button>}
            {!readOnly && <button className="btn btn-primary" disabled={saving} onClick={publish}>Publish</button>}
          </div>
        }
      />
      <ErrorBanner message={error} />

      <section className="designer-config panel">
        <label className="field compact">
          <span>Workflow name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} />
        </label>
        <label className="field compact">
          <span>Department</span>
          <select className="input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={readOnly || !isNew}>
            {departments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        <label className="field compact">
          <span>Complaint category</span>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={readOnly || !isNew}>
            {categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
      </section>

      <div className="designer-shell">
        <aside className="designer-palette panel">
          <div className="designer-section-title">Steps</div>
          <button className="palette-item" onClick={addHumanNode} disabled={readOnly}>
            <strong>+ Human task</strong>
            <span>Role queue or assigned user</span>
          </button>
          <button className="palette-item" onClick={addEndNode} disabled={readOnly}>
            <strong>+ End state</strong>
            <span>Resolved / rejected / closed</span>
          </button>
        </aside>

        <section className="designer-canvas panel">
          {loading ? (
            <div className="loading-block">Loading workflow…</div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={readOnly ? undefined : onNodesChange}
              onEdgesChange={readOnly ? undefined : onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId('') }}
              onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId('') }}
              onPaneClick={() => { setSelectedNodeId(''); setSelectedEdgeId('') }}
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              elementsSelectable
              fitView
              minZoom={0.25}
              maxZoom={1.8}
            >
              <Background gap={22} size={1} />
              <Controls />
              <MiniMap zoomable pannable />
            </ReactFlow>
          )}
        </section>

        <aside className="designer-inspector panel">
          <div className="designer-section-title">Properties</div>
          {selectedNode ? (
            <div className="inspector-form">
              <div className="property-type">NODE · {selectedNode.id}</div>

              <label className="field compact">
                <span>Step name</span>
                <input className="input" value={selectedNode.data.label || ''} onChange={(e) => updateSelectedNode({ label: e.target.value })} disabled={readOnly} />
              </label>

              <label className="field compact">
                <span>Node type</span>
                <select className="input" value={selectedNode.data.nodeType} onChange={(e) => updateSelectedNode({ nodeType: Number(e.target.value) })} disabled={readOnly}>
                  <option value="0">Start</option>
                  <option value="1">Human task</option>
                  <option value="2">End</option>
                </select>
              </label>

              {selectedNode.data.nodeType === workflowNodeType.HumanTask && (
                <>
                  <label className="field compact">
                    <span>Assigned role</span>
                    <input className="input" list="common-roles" value={selectedNode.data.roleCode || ''} onChange={(e) => updateSelectedNode({ roleCode: e.target.value })} disabled={readOnly} />
                    <datalist id="common-roles">
                      {commonRoles.map((role) => <option value={role} key={role} />)}
                    </datalist>
                  </label>

                  <label className="field compact">
                    <span>SLA hours</span>
                    <input className="input" type="number" min="1" value={selectedNode.data.slaHours ?? ''} onChange={(e) => updateSelectedNode({ slaHours: e.target.value })} disabled={readOnly} />
                  </label>

                  <label className="field compact">
                    <span>Escalate to role</span>
                    <input className="input" list="common-roles" value={selectedNode.data.escalationRoleCode || ''} onChange={(e) => updateSelectedNode({ escalationRoleCode: e.target.value })} disabled={readOnly} />
                  </label>

                  <label className="field compact">
                    <span>Assignment mode</span>
                    <select className="input" value={selectedNode.data.assignmentMode || 'queue'} onChange={(e) => updateSelectedNode({ assignmentMode: e.target.value })} disabled={readOnly}>
                      <option value="queue">Role queue</option>
                      <option value="specific">Require specific user</option>
                    </select>
                  </label>

                  <div className="workflow-toggle-row">
                    <div>
                      <strong>Email notification</strong>
                      <div className="muted-text">
                        Notify the assigned user when this complaint reaches this step.
                      </div>
                    </div>

                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!selectedNode.data.sendEmailNotification}
                        onChange={(e) => updateSelectedNode({ sendEmailNotification: e.target.checked })}
                        disabled={readOnly}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <WorkflowFieldBuilder
                    fields={selectedNode.data.fields || []}
                    disabled={readOnly}
                    onChange={(fields) => updateSelectedNode({ fields })}
                  />
                </>
              )}

              {!readOnly && (
                <button className="btn btn-danger-soft" onClick={deleteSelection}>Delete node</button>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="inspector-form">
              <div className="property-type">TRANSITION</div>

              <label className="field compact">
                <span>Button / edge label</span>
                <input className="input" value={selectedEdge.data?.label || selectedEdge.label || ''} onChange={(e) => updateSelectedEdge({ label: e.target.value })} disabled={readOnly} placeholder="e.g. Assign officer" />
              </label>

              <label className="field compact">
                <span>Outcome key</span>
                <input className="input" value={selectedEdge.data?.outcomeKey || ''} onChange={(e) => updateSelectedEdge({ outcomeKey: e.target.value })} disabled={readOnly} placeholder="e.g. assign, approve, reject" />
              </label>

              <div className="edge-route">{selectedEdge.source} → {selectedEdge.target}</div>

              {!readOnly && (
                <button className="btn btn-danger-soft" onClick={deleteSelection}>Delete transition</button>
              )}
            </div>
          ) : (
            <div className="inspector-empty">Select a node or connection to edit its properties.</div>
          )}
        </aside>
      </div>
    </>
  )
}