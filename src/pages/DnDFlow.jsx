import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    updateEdge,
    useEdgesState,
    Controls,
    Background,
} from 'reactflow'
import 'reactflow/dist/style.css'

import create from 'zustand'

import ColorSelectorNode from './CustomNodes/ColorSelectorNode'

import Sidebar from './Sidebar'

import './index.css'
import GptNode from './CustomNodes/GptNode'

export const useBearStore = create((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
}))

const nodeTypes = {
    selectorNode: ColorSelectorNode,
    gptNode: GptNode,
}

const initialNodes = [
    // {
    //     id: '1',
    //     type: 'input',
    //     data: { label: 'root', tag: 'html', children: [] },
    //     position: { x: 50, y: 5 },
    // },
    // {
    //     id: '2',
    //     type: 'selectorNode',
    //     className: 'selectorNode',
    //     data: { label: 'output node', tag: 'h3', children: [] },
    //     style: { border: '1px solid #777', padding: 10 },
    //     position: { x: 150, y: 5 },
    // },
    {
        id: '3',
        type: 'gptNode',
        data: { label: 'h2', tag: 'h2', children: [] },
        position: { x: 200, y: 5 },
    },
    // {
    //   id: "4",
    //   type: "default",
    //   data: { label: "div", tag: "div", children: [] },
    //   position: { x: 250, y: 5 }
    // },
    // {
    //   id: "5",
    //   type: "default",
    //   data: { label: "div", tag: "div", children: [] },
    //   position: { x: 250, y: 5 }
    // }
]

let id = 0
const getId = () => `${id++}`

const DnDFlow = () => {
    const reactFlowWrapper = useRef(null)
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [reactFlowInstance, setReactFlowInstance] = useState(null)

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        markerEnd: {
                            type: 'arrowclosed',
                            color: 'blueviolet',
                        },
                        animated: true,
                        type: 'smoothstep',
                        style: { stroke: 'blueviolet' },
                    },
                    eds
                )
            ),
        [setEdges]
    )

    useEffect(() => {
        console.log('edges' + JSON.stringify(edges))
        console.log('nodes' + JSON.stringify(nodes))
    })

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event) => {
            event.preventDefault()

            const reactFlowBounds =
                reactFlowWrapper.current.getBoundingClientRect()
            const type = event.dataTransfer.getData('application/reactflow')

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            })
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type}`, color: 'hello' },
                sourcePosition: 'right',
                targetPosition: 'left',
            }

            setNodes((nds) => nds.concat(newNode))
        },
        [reactFlowInstance]
    )

    const onEdgeUpdateStart = useCallback(() => {
        reactFlowWrapper.current = false
    }, [])

    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        reactFlowWrapper.current = true
        setEdges((els) => updateEdge(oldEdge, newConnection, els))
    }, [])

    const onEdgeUpdateEnd = useCallback((_, edge) => {
        if (!reactFlowWrapper.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id))
        }

        reactFlowWrapper.current = true
    }, [])
    return (
        <div className='dndflow'>
            <ReactFlowProvider>
                <div
                    className='reactflow-wrapper'
                    ref={reactFlowWrapper}
                    onClick={() => {
                        console.log('Hello')
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onEdgeUpdate={onEdgeUpdate}
                        onEdgeUpdateStart={onEdgeUpdateStart}
                        onEdgeUpdateEnd={onEdgeUpdateEnd}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        connectionLineType='smoothstep'
                        nodeTypes={nodeTypes}
                        onDragOver={onDragOver}
                        fitView
                    >
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
                <Sidebar />
            </ReactFlowProvider>
        </div>
    )
}

export default DnDFlow