import { TreeViewPlugin, ContextMenu } from "@xeokit/xeokit-sdk"
export function applyTreeView(viewer) {

    const treeView = new TreeViewPlugin(viewer, {
        containerElement: document.getElementById("treeViewContainer"),
        hierarchy: "types",
        autoExpandDepth: 1
    })

    const treeViewContextMenu = new ContextMenu({

        items: [
            [
                {
                    title: "View Fit",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        const objectIds = []
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                objectIds.push(treeViewNode.objectId)
                            }
                        })
                        scene.setObjectsVisible(objectIds, true)
                        scene.setObjectsHighlighted(objectIds, true)
                        context.viewer.cameraFlight.flyTo({
                            projection: "perspective",
                            aabb: scene.getAABB(objectIds),
                            duration: 0.5
                        }, () => {
                            setTimeout(function () {
                                scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                            }, 500)
                        })
                    }
                },
                {
                    title: "View Fit All",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        context.viewer.cameraFlight.flyTo({
                            projection: "perspective",
                            aabb: scene.getAABB({}),
                            duration: 0.5
                        })
                    }
                }
            ],
            [
                {
                    title: "Hide",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.visible = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "Hide Others",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.visibleObjectIds, false)
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                        scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.visible = true
                                }
                            }
                        })
                    }
                },
                {
                    title: "Hide All",
                    getEnabled: function (context) {
                        return (context.viewer.scene.visibleObjectIds.length > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsVisible(context.viewer.scene.visibleObjectIds, false)
                    }
                }
            ],
            [
                {
                    title: "Show",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.visible = true
                                    entity.xrayed = false
                                    entity.selected = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "Show Others",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.objectIds, true)
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.visible = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "Show All",
                    getEnabled: function (context) {
                        const scene = context.viewer.scene
                        return (scene.numVisibleObjects < scene.numObjects)
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.objectIds, true)
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                    }
                }
            ],
            [
                {
                    title: "X-Ray",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.xrayed = true
                                    entity.visible = true
                                }
                            }
                        })
                    }
                },
                {
                    title: "Undo X-Ray",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.xrayed = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "X-Ray Others",
                    doAction: function (context) {
                        const scene = context.viewer.scene
                        scene.setObjectsVisible(scene.objectIds, true)
                        scene.setObjectsXRayed(scene.objectIds, true)
                        scene.setObjectsSelected(scene.selectedObjectIds, false)
                        scene.setObjectsHighlighted(scene.highlightedObjectIds, false)
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.xrayed = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "Reset X-Ray",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numXRayedObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsXRayed(context.viewer.scene.xrayedObjectIds, false)
                    }
                }
            ],
            [
                {
                    title: "Select",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.selected = true
                                    entity.visible = true
                                }
                            }
                        })

                    }
                },
                {
                    title: "Deselect",
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId]
                                if (entity) {
                                    entity.selected = false
                                }
                            }
                        })
                    }
                },
                {
                    title: "Clear Selection",
                    getEnabled: function (context) {
                        return (context.viewer.scene.numSelectedObjects > 0)
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsSelected(context.viewer.scene.selectedObjectIds, false)
                    }
                }
            ]
        ]
    })

    treeView.on("contextmenu", (e) => {

        treeViewContextMenu.context = {
            viewer: e.viewer,
            treeViewPlugin: e.treeViewPlugin,
            treeViewNode: e.treeViewNode,
            entity: e.viewer.scene.objects[e.treeViewNode.objectId]
        }

        treeViewContextMenu.show(e.event.pageX, e.event.pageY)
    })


    treeView.on("nodeTitleClicked", (e) => {
        const scene = viewer.scene
        const objectIds = []
        e.treeViewPlugin.withNodeTree(e.treeViewNode, (treeViewNode) => {
            if (treeViewNode.objectId) {
                objectIds.push(treeViewNode.objectId)
            }
        })
        viewer.cameraFlight.flyTo({
            aabb: scene.getAABB(objectIds),
            duration: 0.5
        })

        const ps = viewer.metaScene.metaObjects[e.treeViewNode.objectId]?.propertySets ?? []
        const props = {}
        for (const set of ps) {
            for (const p of set.properties) {
                props[p.name] = p.value
            }
        }
        console.log(props)
    })
    
    return treeView
}